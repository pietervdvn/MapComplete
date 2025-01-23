import ThemeConfig from "../ThemeConfig/ThemeConfig"
import { WithChangesState } from "./WithChangesState"
import FavouritesFeatureSource from "../../Logic/FeatureSource/Sources/FavouritesFeatureSource"
import Constants from "../Constants"
import { FeatureSource } from "../../Logic/FeatureSource/FeatureSource"
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource"
import { Feature } from "geojson"
import { BBox } from "../../Logic/BBox"
import ShowDataLayer from "../../UI/Map/ShowDataLayer"
import MetaTagging from "../../Logic/MetaTagging"
import FilteredLayer from "../FilteredLayer"
import LayerConfig from "../ThemeConfig/LayerConfig"
import { LayerConfigJson } from "../ThemeConfig/Json/LayerConfigJson"
import last_click_layerconfig from "../../assets/generated/layers/last_click.json"
import { GeoOperations } from "../../Logic/GeoOperations"
import summaryLayer from "../../assets/generated/layers/summary.json"
import { UIEventSource } from "../../Logic/UIEventSource"
import NearbyFeatureSource from "../../Logic/FeatureSource/Sources/NearbyFeatureSource"
import {
    SummaryTileSource,
    SummaryTileSourceRewriter
} from "../../Logic/FeatureSource/TiledFeatureSource/SummaryTileSource"
import { ShowDataLayerOptions } from "../../UI/Map/ShowDataLayerOptions"

export class WithSpecialLayers extends WithChangesState {

    readonly favourites: FavouritesFeatureSource
    /**
     * When hovering (in the popup) an image, the location of the image will be revealed on the main map.
     * This store contains those images that should be shown, probably only the currently hovered image
     */
    readonly geocodedImages: UIEventSource<Feature[]> = new UIEventSource<Feature[]>([])
    /**
     * Contains a few (<10) >features that are near the center of the map.
     */
    readonly closestFeatures: NearbyFeatureSource

    readonly featureSummary: SummaryTileSourceRewriter
    /**
     * When using arrow keys to move, the accessibility mode is activated, which has a small rectangle set.
     * This is the 'viewport' which 'closestFeatures' uses to filter wilt
     */
    readonly visualFeedbackViewportBounds: UIEventSource<BBox> = new UIEventSource<BBox>(undefined)


    constructor(theme: ThemeConfig, mvtAvailableLayers: Set<string>) {
        super(theme, mvtAvailableLayers)

        this.favourites = new FavouritesFeatureSource(this)

        this.closestFeatures = new NearbyFeatureSource(
            this.mapProperties.location,
            this.perLayerFiltered,
            {
                currentZoom: this.mapProperties.zoom,
                layerState: this.layerState,
                bounds: this.visualFeedbackViewportBounds.map(
                    (bounds) => bounds ?? this.mapProperties.bounds?.data,
                    [this.mapProperties.bounds]
                )
            }
        )
        this.closestFeatures.registerSource(this.favourites, "favourite")

        this.featureSummary = this.setupSummaryLayer()
        this.initActorsSpecialLayers()
        this.drawSpecialLayers()
        this.drawLastClick()
        // Note: the lock-range is handled by UserMapFeatureSwitchState
        {
            // Activate metatagging for the 'current_view' layer
            console.log(">>>", this.layerState.filteredLayers)
            const currentViewLayer = this.layerState.filteredLayers.get("current_view")?.layerDef
            if (currentViewLayer?.tagRenderings?.length > 0) {
                const params = MetaTagging.createExtraFuncParams(this)
                this.currentView.features.addCallbackAndRunD((features) => {
                    MetaTagging.addMetatags(
                        features,
                        params,
                        currentViewLayer,
                        this.theme,
                        this.osmObjectDownloader,
                        this.featureProperties
                    )
                })
            }
        }


    }


    private setupSummaryLayer(): SummaryTileSourceRewriter | undefined {
        /**
         * MaxZoom for the summary layer
         */
        const normalLayers = this.theme.layers.filter((l) => l.isNormal())

        const maxzoom = Math.min(...normalLayers.map((l) => l.minzoom))

        const layers = this.theme.layers.filter(
            (l) =>
                (<string[]>(<unknown>Constants.priviliged_layers)).indexOf(l.id) < 0 &&
                l.source.geojsonSource === undefined &&
                l.doCount
        )
        if (!Constants.SummaryServer || layers.length === 0) {
            return undefined
        }
        const summaryTileSource = new SummaryTileSource(
            Constants.SummaryServer,
            layers.map((l) => l.id),
            this.mapProperties.zoom.map((z) => Math.max(Math.floor(z), 0)),
            this.mapProperties,
            {
                isActive: this.mapProperties.zoom.map((z) => z < maxzoom)
            }
        )

        const source = new SummaryTileSourceRewriter(summaryTileSource, this.layerState.filteredLayers)

        new ShowDataLayer(this.map, {
            features: source,
            layer: new LayerConfig(<LayerConfigJson>summaryLayer, "summaryLayer"),
            // doShowLayer: this.mapProperties.zoom.map((z) => z < maxzoom),
            selectedElement: this.selectedElement
        })
        return source
    }

    protected registerSpecialLayer(flayer: FilteredLayer, source: FeatureSource) {
        if (!source?.features) {
            return
        }

        this.featureProperties.trackFeatureSource(source)
        const options: ShowDataLayerOptions & { layer: LayerConfig } = {
            features: source,
            doShowLayer: flayer.isDisplayed,
            layer: flayer.layerDef,
            metaTags: this.userRelatedState.preferencesAsTags,
            selectedElement: this.selectedElement
        }
        new ShowDataLayer(this.map, options)
    }

    private drawLastClick() {
        const source = this.lastClickObject
        const lastClickLayerConfig = new LayerConfig(
            <LayerConfigJson>last_click_layerconfig,
            "last_click"
        )
        const lastClickFiltered =
            lastClickLayerConfig.isShown === undefined
                ? source
                : source.features.mapD((fs) =>
                    fs.filter((f) => {
                        const matches = lastClickLayerConfig.isShown.matchesProperties(
                            f.properties
                        )
                        console.debug("LastClick ", f, "matches", matches)
                        return matches
                    })
                )
        // show last click = new point/note marker
        new ShowDataLayer(this.map, {
            features: new StaticFeatureSource(lastClickFiltered),
            layer: lastClickLayerConfig,
            onClick: (feature) => {
                if (this.mapProperties.zoom.data >= Constants.minZoomLevelToAddNewPoint) {
                    this.selectedElement.setData(feature)
                    return
                }
                this.map.data.flyTo({
                    zoom: Constants.minZoomLevelToAddNewPoint,
                    center: GeoOperations.centerpointCoordinates(feature)
                })
            }
        })
    }

    private drawSpecialLayers() {

        type AddedByDefaultTypes = (typeof Constants.added_by_default)[number]
        type LayersToAdd = "current_view" | Exclude<AddedByDefaultTypes,
            "search" // Handled by WithSearchState
            | "last_click" // handled by this.drawLastClick()
            | "summary" // handled by setupSummaryLayer
            | "range" // handled by UserMapFeatureSwitchState
        >
        const empty = []
        /**
         * A listing which maps the layerId onto the featureSource
         */
        const specialLayers: Record<LayersToAdd, FeatureSource> = {
            home_location: this.userRelatedState.homeLocation,
            gps_location: this.geolocation.currentUserLocation,
            gps_location_history: this.geolocation.historicalUserLocations,
            gps_track: this.geolocation.historicalUserLocationsTrack,
            current_view: this.currentView,
            favourite: this.favourites,
            geocoded_image: new StaticFeatureSource(this.geocodedImages),
            selected_element: new StaticFeatureSource(
                this.selectedElement.map((f) => (f === undefined ? empty : [f]))
            )
        }


        // enumerate all 'normal' layers and match them with the appropriate 'special' layer - if applicable
        this.layerState.filteredLayers.forEach((flayer) => {
            this.registerSpecialLayer(flayer, specialLayers[flayer.layerDef.id])
        })

    }

    private initActorsSpecialLayers() {
        this.selectedElement.addCallback((selected) => {
            if (selected === undefined) {
                this.focusOnMap()
                this.geocodedImages.set([])
            } else {
                this.lastClickObject.clear()
            }
        })
    }

}
