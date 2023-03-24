import { Store, UIEventSource } from "../UIEventSource"
import Attribution from "../../UI/BigComponents/Attribution"
import BaseUIElement from "../../UI/BaseUIElement"
import FilteredLayer, { FilterState } from "../../Models/FilteredLayer"
import TilesourceConfig from "../../Models/ThemeConfig/TilesourceConfig"
import { QueryParameters } from "../Web/QueryParameters"
import ShowOverlayLayer from "../../UI/ShowDataLayer/ShowOverlayLayer"
import { FeatureSourceForLayer, Tiled } from "../FeatureSource/FeatureSource"
import { LocalStorageSource } from "../Web/LocalStorageSource"
import TitleHandler from "../Actors/TitleHandler"
import { BBox } from "../BBox"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import StaticFeatureSource, {
    TiledStaticFeatureSource,
} from "../FeatureSource/Sources/StaticFeatureSource"
import { OsmConnection } from "../Osm/OsmConnection"
import { Feature } from "geojson"
import { Map as MlMap } from "maplibre-gl"
import { GlobalFilter } from "../../Models/GlobalFilter"
import { MapProperties } from "../../Models/MapProperties"
import ShowDataLayer from "../../UI/Map/ShowDataLayer"

/**
 * Contains all the leaflet-map related state
 */
export default class MapState {


    /**
     * Last location where a click was registered
     */
    public readonly LastClickLocation: UIEventSource<{
        lat: number
        lon: number
    }> = new UIEventSource<{ lat: number; lon: number }>(undefined)

    /**
     * The bounds of the current map view
     */
    public currentView: FeatureSourceForLayer & Tiled

    /**
     * A builtin layer which contains the selected element.
     * Loads 'selected_element.json'
     * This _might_ contain multiple points, e.g. every center of a multipolygon
     */
    public selectedElementsLayer: FeatureSourceForLayer & Tiled

    public readonly mainMapObject: BaseUIElement

    /**
     * Which layers are enabled in the current theme and what filters are applied onto them
     */
    public filteredLayers: UIEventSource<FilteredLayer[]> = new UIEventSource<FilteredLayer[]>(
        [],
        "filteredLayers"
    )

    /**
     * Filters which apply onto all layers
     */
    public globalFilters: UIEventSource<GlobalFilter[]> = new UIEventSource([], "globalFilters")

    /**
     * Which overlays are shown
     */
    public overlayToggles: { config: TilesourceConfig; isDisplayed: UIEventSource<boolean> }[]

    constructor() {
        this.availableBackgroundLayers = AvailableBaseLayers.AvailableLayersAt(this.locationControl)

        let defaultLayer = AvailableBaseLayers.osmCarto
        const available = this.availableBackgroundLayers.data
        for (const layer of available) {
            if (this.backgroundLayerId.data === layer.id) {
                defaultLayer = layer
            }
        }
        const self = this
        this.backgroundLayer = new UIEventSource<BaseLayer>(defaultLayer)
        this.backgroundLayer.addCallbackAndRunD((layer) => self.backgroundLayerId.setData(layer.id))

        // Will write into this.leafletMap
        this.mainMapObject = Minimap.createMiniMap({
            background: this.backgroundLayer,
            location: this.locationControl,
            leafletMap: this.leafletMap,
            bounds: this.currentBounds,
            attribution: attr,
            lastClickLocation: this.LastClickLocation,
        })

        this.overlayToggles =
            this.layoutToUse?.tileLayerSources
                ?.filter((c) => c.name !== undefined)
                ?.map((c) => ({
                    config: c,
                    isDisplayed: QueryParameters.GetBooleanQueryParameter(
                        "overlay-" + c.id,
                        c.defaultState,
                        "Wether or not the overlay " + c.id + " is shown"
                    ),
                })) ?? []
        this.filteredLayers = new UIEventSource<FilteredLayer[]>(
            MapState.InitializeFilteredLayers(this.layoutToUse, this.osmConnection)
        )

        this.AddAllOverlaysToMap(this.leafletMap)

        this.initCurrentView()
        this.initSelectedElement()

        new TitleHandler(this)
    }

    public AddAllOverlaysToMap(leafletMap: UIEventSource<any>) {
        const initialized = new Set()
        for (const overlayToggle of this.overlayToggles) {
            new ShowOverlayLayer(overlayToggle.config, leafletMap, overlayToggle.isDisplayed)
            initialized.add(overlayToggle.config)
        }

        for (const tileLayerSource of this.layoutToUse?.tileLayerSources ?? []) {
            if (initialized.has(tileLayerSource)) {
                continue
            }
            new ShowOverlayLayer(tileLayerSource, leafletMap)
        }
    }


    private initCurrentView() {
        let currentViewLayer: FilteredLayer = this.filteredLayers.data.filter(
            (l) => l.layerDef.id === "current_view"
        )[0]

        if (currentViewLayer === undefined) {
            // This layer is not needed by the theme and thus unloaded
            return
        }

        let i = 0
        const self = this
        const features: Store<Feature[]> = this.currentBounds.map((bounds) => {
            if (bounds === undefined) {
                return []
            }
            i++
            const feature = {
                type: "Feature",
                properties: {
                    id: "current_view-" + i,
                    current_view: "yes",
                    zoom: "" + self.locationControl.data.zoom,
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [
                        [
                            [bounds.maxLon, bounds.maxLat],
                            [bounds.minLon, bounds.maxLat],
                            [bounds.minLon, bounds.minLat],
                            [bounds.maxLon, bounds.minLat],
                            [bounds.maxLon, bounds.maxLat],
                        ],
                    ],
                },
            }
            return [feature]
        })

        this.currentView = new TiledStaticFeatureSource(features, currentViewLayer)
    }

    private initSelectedElement() {
        const layerDef: FilteredLayer = this.filteredLayers.data.filter(
            (l) => l.layerDef.id === "selected_element"
        )[0]
        const empty = []
        const store = this.selectedElement.map((feature) => {
            if (feature === undefined || feature === null) {
                return empty
            }
            return [
                {
                    feature: {
                        type: "Feature",
                        properties: {
                            selected: "yes",
                            id: "selected" + feature.properties.id,
                        },
                        geometry: feature.geometry,
                    },
                    freshness: new Date(),
                },
            ]
        })
        this.selectedElementsLayer = new TiledStaticFeatureSource(store, layerDef)
    }

    private static getPref(
        osmConnection: OsmConnection,
        key: string,
        layer: LayerConfig
    ): UIEventSource<boolean> {
        return osmConnection.GetPreference(key, layer.shownByDefault + "").sync(
            (v) => {
                if (v === undefined) {
                    return undefined
                }
                return v === "true"
            },
            [],
            (b) => {
                if (b === undefined) {
                    return undefined
                }
                return "" + b
            }
        )
    }

    public static InitializeFilteredLayers(
        layoutToUse: { layers: LayerConfig[]; id: string },
        osmConnection: OsmConnection
    ): FilteredLayer[] {
        if (layoutToUse === undefined) {
            return []
        }
        const flayers: FilteredLayer[] = []
        for (const layer of layoutToUse.layers) {
            let isDisplayed: UIEventSource<boolean>
            if (layer.syncSelection === "local") {
                isDisplayed = LocalStorageSource.GetParsed(
                    layoutToUse.id + "-layer-" + layer.id + "-enabled",
                    layer.shownByDefault
                )
            } else if (layer.syncSelection === "theme-only") {
                isDisplayed = MapState.getPref(
                    osmConnection,
                    layoutToUse.id + "-layer-" + layer.id + "-enabled",
                    layer
                )
            } else if (layer.syncSelection === "global") {
                isDisplayed = MapState.getPref(
                    osmConnection,
                    "layer-" + layer.id + "-enabled",
                    layer
                )
            } else {
                isDisplayed = QueryParameters.GetBooleanQueryParameter(
                    "layer-" + layer.id,
                    layer.shownByDefault,
                    "Wether or not layer " + layer.id + " is shown"
                )
            }

            const flayer: FilteredLayer = {
                isDisplayed,
                layerDef: layer,
                appliedFilters: new UIEventSource<Map<string, FilterState>>(
                    new Map<string, FilterState>()
                ),
            }
            layer.filters.forEach((filterConfig) => {
                const stateSrc = filterConfig.initState()

                stateSrc.addCallbackAndRun((state) =>
                    flayer.appliedFilters.data.set(filterConfig.id, state)
                )
                flayer.appliedFilters
                    .map((dict) => dict.get(filterConfig.id))
                    .addCallback((state) => stateSrc.setData(state))
            })

            flayers.push(flayer)
        }

        for (const layer of layoutToUse.layers) {
            if (layer.filterIsSameAs === undefined) {
                continue
            }
            const toReuse = flayers.find((l) => l.layerDef.id === layer.filterIsSameAs)
            if (toReuse === undefined) {
                throw (
                    "Error in layer " +
                    layer.id +
                    ": it defines that it should be use the filters of " +
                    layer.filterIsSameAs +
                    ", but this layer was not loaded"
                )
            }
            console.warn(
                "Linking filter and isDisplayed-states of " +
                    layer.id +
                    " and " +
                    layer.filterIsSameAs
            )
            const selfLayer = flayers.findIndex((l) => l.layerDef.id === layer.id)
            flayers[selfLayer] = {
                isDisplayed: toReuse.isDisplayed,
                layerDef: layer,
                appliedFilters: toReuse.appliedFilters,
            }
        }

        return flayers
    }
}
