import LayoutConfig from "./ThemeConfig/LayoutConfig"
import { SpecialVisualizationState } from "../UI/SpecialVisualization"
import { Changes } from "../Logic/Osm/Changes"
import { ImmutableStore, Store, UIEventSource } from "../Logic/UIEventSource"
import {
    FeatureSource,
    IndexedFeatureSource,
    WritableFeatureSource,
} from "../Logic/FeatureSource/FeatureSource"
import { OsmConnection } from "../Logic/Osm/OsmConnection"
import { MapProperties } from "./MapProperties"
import LayerState from "../Logic/State/LayerState"
import { Feature } from "geojson"
import FullNodeDatabaseSource from "../Logic/FeatureSource/TiledFeatureSource/FullNodeDatabaseSource"
import { Map as MlMap } from "maplibre-gl"
import InitialMapPositioning from "../Logic/Actors/InitialMapPositioning"
import { MapLibreAdaptor } from "../UI/Map/MapLibreAdaptor"
import { GeoLocationState } from "../Logic/State/GeoLocationState"
import FeatureSwitchState from "../Logic/State/FeatureSwitchState"
import { QueryParameters } from "../Logic/Web/QueryParameters"
import UserRelatedState from "../Logic/State/UserRelatedState"
import LayerConfig from "./ThemeConfig/LayerConfig"
import GeoLocationHandler from "../Logic/Actors/GeoLocationHandler"
import { AvailableRasterLayers, RasterLayerPolygon } from "./RasterLayers"
import LayoutSource from "../Logic/FeatureSource/Sources/LayoutSource"
import StaticFeatureSource from "../Logic/FeatureSource/Sources/StaticFeatureSource"
import FeaturePropertiesStore from "../Logic/FeatureSource/Actors/FeaturePropertiesStore"
import PerLayerFeatureSourceSplitter from "../Logic/FeatureSource/PerLayerFeatureSourceSplitter"
import SaveFeatureSourceToLocalStorage from "../Logic/FeatureSource/Actors/SaveFeatureSourceToLocalStorage"
import FilteringFeatureSource from "../Logic/FeatureSource/Sources/FilteringFeatureSource"
import ShowDataLayer from "../UI/Map/ShowDataLayer"
import TitleHandler from "../Logic/Actors/TitleHandler"
import ChangeToElementsActor from "../Logic/Actors/ChangeToElementsActor"
import PendingChangesUploader from "../Logic/Actors/PendingChangesUploader"
import SelectedElementTagsUpdater from "../Logic/Actors/SelectedElementTagsUpdater"
import { BBox } from "../Logic/BBox"
import Constants from "./Constants"
import Hotkeys from "../UI/Base/Hotkeys"
import Translations from "../UI/i18n/Translations"
import { GeoIndexedStoreForLayer } from "../Logic/FeatureSource/Actors/GeoIndexedStore"
import { LastClickFeatureSource } from "../Logic/FeatureSource/Sources/LastClickFeatureSource"
import SimpleFeatureSource from "../Logic/FeatureSource/Sources/SimpleFeatureSource"
import { MenuState } from "./MenuState"

/**
 *
 * The themeviewState contains all the state needed for the themeViewGUI.
 *
 * This is pretty much the 'brain' or the HQ of MapComplete
 *
 * It ties up all the needed elements and starts some actors.
 */
export default class ThemeViewState implements SpecialVisualizationState {
    readonly layout: LayoutConfig
    readonly map: UIEventSource<MlMap>
    readonly changes: Changes
    readonly featureSwitches: FeatureSwitchState
    readonly featureSwitchIsTesting: Store<boolean>
    readonly featureSwitchUserbadge: Store<boolean>

    readonly featureProperties: FeaturePropertiesStore

    readonly osmConnection: OsmConnection
    readonly selectedElement: UIEventSource<Feature>
    readonly mapProperties: MapProperties

    readonly dataIsLoading: Store<boolean> // TODO
    readonly guistate: MenuState
    readonly fullNodeDatabase?: FullNodeDatabaseSource // TODO

    readonly historicalUserLocations: WritableFeatureSource
    readonly indexedFeatures: IndexedFeatureSource
    readonly newFeatures: WritableFeatureSource
    readonly layerState: LayerState
    readonly perLayer: ReadonlyMap<string, GeoIndexedStoreForLayer>
    readonly availableLayers: Store<RasterLayerPolygon[]>
    readonly selectedLayer: UIEventSource<LayerConfig>
    readonly userRelatedState: UserRelatedState
    readonly geolocation: GeoLocationHandler

    readonly lastClickObject: WritableFeatureSource
    constructor(layout: LayoutConfig) {
        this.layout = layout
        this.guistate = new MenuState()
        this.map = new UIEventSource<MlMap>(undefined)
        const initial = new InitialMapPositioning(layout)
        this.mapProperties = new MapLibreAdaptor(this.map, initial)
        const geolocationState = new GeoLocationState()

        this.featureSwitches = new FeatureSwitchState(layout)
        this.featureSwitchIsTesting = this.featureSwitches.featureSwitchIsTesting
        this.featureSwitchUserbadge = this.featureSwitches.featureSwitchUserbadge

        this.osmConnection = new OsmConnection({
            dryRun: this.featureSwitches.featureSwitchIsTesting,
            fakeUser: this.featureSwitches.featureSwitchFakeUser.data,
            oauth_token: QueryParameters.GetQueryParameter(
                "oauth_token",
                undefined,
                "Used to complete the login"
            ),
            osmConfiguration: <"osm" | "osm-test">this.featureSwitches.featureSwitchApiURL.data,
        })
        this.userRelatedState = new UserRelatedState(this.osmConnection, layout?.language, layout)
        this.selectedElement = new UIEventSource<Feature | undefined>(undefined, "Selected element")
        this.selectedLayer = new UIEventSource<LayerConfig>(undefined, "Selected layer")
        this.geolocation = new GeoLocationHandler(
            geolocationState,
            this.selectedElement,
            this.mapProperties,
            this.userRelatedState.gpsLocationHistoryRetentionTime
        )

        this.availableLayers = AvailableRasterLayers.layersAvailableAt(this.mapProperties.location)

        const self = this
        this.layerState = new LayerState(this.osmConnection, layout.layers, layout.id)
        this.newFeatures = new SimpleFeatureSource(undefined)
        const layoutSource = new LayoutSource(
            layout.layers,
            this.featureSwitches,
            this.newFeatures,
            this.mapProperties,
            this.osmConnection.Backend(),
            (id) => self.layerState.filteredLayers.get(id).isDisplayed
        )
        this.indexedFeatures = layoutSource
        this.dataIsLoading = layoutSource.isLoading
        const lastClick = (this.lastClickObject = new LastClickFeatureSource(
            this.mapProperties.lastClickLocation,
            this.layout
        ))
        const indexedElements = this.indexedFeatures
        this.featureProperties = new FeaturePropertiesStore(indexedElements)
        const perLayer = new PerLayerFeatureSourceSplitter(
            Array.from(this.layerState.filteredLayers.values()).filter(
                (l) => l.layerDef?.source !== null
            ),
            indexedElements,
            {
                constructStore: (features, layer) => new GeoIndexedStoreForLayer(features, layer),
                handleLeftovers: (features) => {
                    console.warn(
                        "Got ",
                        features.length,
                        "leftover features, such as",
                        features[0].properties
                    )
                },
            }
        )
        this.perLayer = perLayer.perLayer

        this.perLayer.forEach((fs) => {
            new SaveFeatureSourceToLocalStorage(fs.layer.layerDef.id, 15, fs)

            const filtered = new FilteringFeatureSource(
                fs.layer,
                fs,
                (id) => this.featureProperties.getStore(id),
                this.layerState.globalFilters
            )
            const doShowLayer = this.mapProperties.zoom.map(
                (z) =>
                    (fs.layer.isDisplayed?.data ?? true) && z >= (fs.layer.layerDef?.minzoom ?? 0),
                [fs.layer.isDisplayed]
            )

            new ShowDataLayer(this.map, {
                layer: fs.layer.layerDef,
                features: filtered,
                doShowLayer,
                selectedElement: this.selectedElement,
                selectedLayer: this.selectedLayer,
                fetchStore: (id) => this.featureProperties.getStore(id),
            })
        })

        this.changes = new Changes(
            {
                dryRun: this.featureSwitches.featureSwitchIsTesting,
                allElements: indexedElements,
                featurePropertiesStore: this.featureProperties,
                osmConnection: this.osmConnection,
                historicalUserLocations: this.geolocation.historicalUserLocations,
            },
            layout?.isLeftRightSensitive() ?? false
        )

        this.initActors()
        this.drawSpecialLayers(lastClick)
        this.initHotkeys()
        this.miscSetup()
        console.log("State setup completed", this)
    }

    /**
     * Various small methods that need to be called
     */
    private miscSetup() {
        this.userRelatedState.markLayoutAsVisited(this.layout)
    }

    private initHotkeys() {
        Hotkeys.RegisterHotkey(
            { nomod: "Escape", onUp: true },
            Translations.t.hotkeyDocumentation.closeSidebar,
            () => {
                this.selectedElement.setData(undefined)
                this.guistate.closeAll()
            }
        )

        Hotkeys.RegisterHotkey(
            {
                nomod: "b",
            },
            Translations.t.hotkeyDocumentation.openLayersPanel,
            () => {
                if (this.featureSwitches.featureSwitchFilter.data) {
                    this.guistate.openFilterView()
                }
            }
        )
        /*
        Hotkeys.RegisterHotkey(
            { shift: "O" },
            Translations.t.hotkeyDocumentation.selectMapnik,
            () => {
                this.state.backgroundLayer.setData(AvailableBaseLayers.osmCarto)
            }
        )//*/
    }

    /**
     * Add the special layers to the map
     * @private
     */
    private drawSpecialLayers(last_click: LastClickFeatureSource) {
        type AddedByDefaultTypes = typeof Constants.added_by_default[number]
        const empty = []
        {
            // The last_click gets a _very_ special treatment

            const last_click_layer = this.layerState.filteredLayers.get("last_click")
            this.featureProperties.addSpecial(
                "last_click",
                new UIEventSource<Record<string, string>>(last_click.properties)
            )
            new ShowDataLayer(this.map, {
                features: last_click,
                doShowLayer: new ImmutableStore(true),
                layer: last_click_layer.layerDef,
                selectedElement: this.selectedElement,
                selectedLayer: this.selectedLayer,
                onClick: (feature: Feature) => {
                    if (this.mapProperties.zoom.data < Constants.minZoomLevelToAddNewPoint) {
                        this.map.data.flyTo({
                            zoom: Constants.minZoomLevelToAddNewPoint,
                            center: this.mapProperties.lastClickLocation.data,
                        })
                        return
                    }
                    this.selectedElement.setData(feature)
                    this.selectedLayer.setData(last_click_layer.layerDef)
                },
            })
        }

        /**
         * A listing which maps the layerId onto the featureSource
         */
        const specialLayers: Record<
            Exclude<AddedByDefaultTypes, "last_click"> | "current_view",
            FeatureSource
        > = {
            home_location: this.userRelatedState.homeLocation,
            gps_location: this.geolocation.currentUserLocation,
            gps_location_history: this.geolocation.historicalUserLocations,
            gps_track: this.geolocation.historicalUserLocationsTrack,
            selected_element: new StaticFeatureSource(
                this.selectedElement.map((f) => (f === undefined ? empty : [f]))
            ),
            range: new StaticFeatureSource(
                this.mapProperties.maxbounds.map((bbox) =>
                    bbox === undefined ? empty : <Feature[]>[bbox.asGeoJson({ id: "range" })]
                )
            ),
            current_view: new StaticFeatureSource(
                this.mapProperties.bounds.map((bbox) =>
                    bbox === undefined ? empty : <Feature[]>[bbox.asGeoJson({ id: "current_view" })]
                )
            ),
        }
        if (this.layout?.lockLocation) {
            const bbox = new BBox(this.layout.lockLocation)
            this.mapProperties.maxbounds.setData(bbox)
            ShowDataLayer.showRange(
                this.map,
                new StaticFeatureSource([bbox.asGeoJson({})]),
                this.featureSwitches.featureSwitchIsTesting
            )
        }

        this.layerState.filteredLayers
            .get("range")
            ?.isDisplayed?.syncWith(this.featureSwitches.featureSwitchIsTesting, true)

        this.layerState.filteredLayers.forEach((flayer) => {
            const features = specialLayers[flayer.layerDef.id]
            if (features === undefined) {
                return
            }
            new ShowDataLayer(this.map, {
                features,
                doShowLayer: flayer.isDisplayed,
                layer: flayer.layerDef,
                selectedElement: this.selectedElement,
                selectedLayer: this.selectedLayer,
            })
        })
    }

    /**
     * Setup various services for which no reference are needed
     * @private
     */
    private initActors() {
        // Various actors that we don't need to reference
        new TitleHandler(this.selectedElement, this.selectedLayer, this.featureProperties, this)
        new ChangeToElementsActor(this.changes, this.featureProperties)
        new PendingChangesUploader(this.changes, this.selectedElement)
        new SelectedElementTagsUpdater(this)
    }
}
