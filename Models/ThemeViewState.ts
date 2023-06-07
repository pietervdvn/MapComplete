import LayoutConfig from "./ThemeConfig/LayoutConfig"
import {SpecialVisualizationState} from "../UI/SpecialVisualization"
import {Changes} from "../Logic/Osm/Changes"
import {ImmutableStore, Store, UIEventSource} from "../Logic/UIEventSource"
import {FeatureSource, IndexedFeatureSource, WritableFeatureSource,} from "../Logic/FeatureSource/FeatureSource"
import {OsmConnection} from "../Logic/Osm/OsmConnection"
import {ExportableMap, MapProperties} from "./MapProperties"
import LayerState from "../Logic/State/LayerState"
import {Feature, Point, Polygon} from "geojson"
import FullNodeDatabaseSource from "../Logic/FeatureSource/TiledFeatureSource/FullNodeDatabaseSource"
import {Map as MlMap} from "maplibre-gl"
import InitialMapPositioning from "../Logic/Actors/InitialMapPositioning"
import {MapLibreAdaptor} from "../UI/Map/MapLibreAdaptor"
import {GeoLocationState} from "../Logic/State/GeoLocationState"
import FeatureSwitchState from "../Logic/State/FeatureSwitchState"
import {QueryParameters} from "../Logic/Web/QueryParameters"
import UserRelatedState from "../Logic/State/UserRelatedState"
import LayerConfig from "./ThemeConfig/LayerConfig"
import GeoLocationHandler from "../Logic/Actors/GeoLocationHandler"
import {AvailableRasterLayers, RasterLayerPolygon, RasterLayerUtils} from "./RasterLayers"
import LayoutSource from "../Logic/FeatureSource/Sources/LayoutSource"
import StaticFeatureSource from "../Logic/FeatureSource/Sources/StaticFeatureSource"
import FeaturePropertiesStore from "../Logic/FeatureSource/Actors/FeaturePropertiesStore"
import PerLayerFeatureSourceSplitter from "../Logic/FeatureSource/PerLayerFeatureSourceSplitter"
import FilteringFeatureSource from "../Logic/FeatureSource/Sources/FilteringFeatureSource"
import ShowDataLayer from "../UI/Map/ShowDataLayer"
import TitleHandler from "../Logic/Actors/TitleHandler"
import ChangeToElementsActor from "../Logic/Actors/ChangeToElementsActor"
import PendingChangesUploader from "../Logic/Actors/PendingChangesUploader"
import SelectedElementTagsUpdater from "../Logic/Actors/SelectedElementTagsUpdater"
import {BBox} from "../Logic/BBox"
import Constants from "./Constants"
import Hotkeys from "../UI/Base/Hotkeys"
import Translations from "../UI/i18n/Translations"
import {GeoIndexedStoreForLayer} from "../Logic/FeatureSource/Actors/GeoIndexedStore"
import {LastClickFeatureSource} from "../Logic/FeatureSource/Sources/LastClickFeatureSource"
import {MenuState} from "./MenuState"
import MetaTagging from "../Logic/MetaTagging"
import ChangeGeometryApplicator from "../Logic/FeatureSource/Sources/ChangeGeometryApplicator"
import {NewGeometryFromChangesFeatureSource} from "../Logic/FeatureSource/Sources/NewGeometryFromChangesFeatureSource"
import OsmObjectDownloader from "../Logic/Osm/OsmObjectDownloader"
import ShowOverlayRasterLayer from "../UI/Map/ShowOverlayRasterLayer"
import {Utils} from "../Utils"
import {EliCategory} from "./RasterLayerProperties"
import BackgroundLayerResetter from "../Logic/Actors/BackgroundLayerResetter"
import SaveFeatureSourceToLocalStorage from "../Logic/FeatureSource/Actors/SaveFeatureSourceToLocalStorage"
import BBoxFeatureSource from "../Logic/FeatureSource/Sources/TouchesBboxFeatureSource"
import ThemeViewStateHashActor from "../Logic/Web/ThemeViewStateHashActor";

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
    readonly mapProperties: MapProperties & ExportableMap
    readonly osmObjectDownloader: OsmObjectDownloader

    readonly dataIsLoading: Store<boolean>
    readonly guistate: MenuState
    readonly fullNodeDatabase?: FullNodeDatabaseSource // TODO

    readonly historicalUserLocations: WritableFeatureSource<Feature<Point>>
    readonly indexedFeatures: IndexedFeatureSource & LayoutSource
    readonly currentView: FeatureSource<Feature<Polygon>>
    readonly featuresInView: FeatureSource
    readonly newFeatures: WritableFeatureSource
    readonly layerState: LayerState
    readonly perLayer: ReadonlyMap<string, GeoIndexedStoreForLayer>
    readonly availableLayers: Store<RasterLayerPolygon[]>
    readonly selectedLayer: UIEventSource<LayerConfig>
    readonly userRelatedState: UserRelatedState
    readonly geolocation: GeoLocationHandler

    readonly lastClickObject: WritableFeatureSource
    readonly overlayLayerStates: ReadonlyMap<
        string,
        { readonly isDisplayed: UIEventSource<boolean> }
    >
    /**
     * All 'level'-tags that are available with the current features
     */
    readonly floors: Store<string[]>

    constructor(layout: LayoutConfig) {
        this.layout = layout
        this.guistate = new MenuState(layout.id)
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
        this.userRelatedState = new UserRelatedState(
            this.osmConnection,
            layout?.language,
            layout,
            this.featureSwitches
        )
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

        {
            const overlayLayerStates = new Map<string, { isDisplayed: UIEventSource<boolean> }>()
            for (const rasterInfo of this.layout.tileLayerSources) {
                const isDisplayed = QueryParameters.GetBooleanQueryParameter(
                    "overlay-" + rasterInfo.id,
                    rasterInfo.defaultState ?? true,
                    "Wether or not overlayer layer " + rasterInfo.id + " is shown"
                )
                const state = {isDisplayed}
                overlayLayerStates.set(rasterInfo.id, state)
                new ShowOverlayRasterLayer(rasterInfo, this.map, this.mapProperties, state)
            }
            this.overlayLayerStates = overlayLayerStates
        }

        {
            /* Setup the layout source
             * A bit tricky, as this is heavily intertwined with the 'changes'-element, which generate a stream of new and changed features too
             */


            if (this.layout.layers.some(l => l._needsFullNodeDatabase)) {
                this.fullNodeDatabase = new FullNodeDatabaseSource()
            }

            const layoutSource = new LayoutSource(
                layout.layers,
                this.featureSwitches,
                this.mapProperties,
                this.osmConnection.Backend(),
                (id) => self.layerState.filteredLayers.get(id).isDisplayed,
                this.fullNodeDatabase
            )
            this.indexedFeatures = layoutSource
            const empty = []
            let currentViewIndex = 0
            this.currentView = new StaticFeatureSource(
                this.mapProperties.bounds.map((bbox) => {
                        if (!bbox) {
                            return empty
                        }
                        currentViewIndex++
                        return <Feature[]>[bbox.asGeoJson({
                                zoom: this.mapProperties.zoom.data,
                                ...this.mapProperties.location.data,
                                id: "current_view"
                            }
                        )];
                    }
                )
            )
            this.featuresInView = new BBoxFeatureSource(layoutSource, this.mapProperties.bounds)
            this.dataIsLoading = layoutSource.isLoading

            const indexedElements = this.indexedFeatures
            this.featureProperties = new FeaturePropertiesStore(indexedElements)
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
            this.historicalUserLocations = this.geolocation.historicalUserLocations
            this.newFeatures = new NewGeometryFromChangesFeatureSource(
                this.changes,
                indexedElements,
                this.osmConnection.Backend()
            )
            layoutSource.addSource(this.newFeatures)

            const perLayer = new PerLayerFeatureSourceSplitter(
                Array.from(this.layerState.filteredLayers.values()).filter(
                    (l) => l.layerDef?.source !== null
                ),
                new ChangeGeometryApplicator(this.indexedFeatures, this.changes),
                {
                    constructStore: (features, layer) =>
                        new GeoIndexedStoreForLayer(features, layer),
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
        }
        this.perLayer.forEach((fs) => {
            new SaveFeatureSourceToLocalStorage(
                this.osmConnection.Backend(),
                fs.layer.layerDef.id,
                15,
                fs,
                this.featureProperties,
                fs.layer.layerDef.maxAgeOfCache
            )
        })

        this.floors = this.featuresInView.features.stabilized(500).map((features) => {
            if (!features) {
                return []
            }
            const floors = new Set<string>()
            for (const feature of features) {
                const level = feature.properties["level"]
                if (level) {
                    const levels = level.split(";")
                    for (const l of levels) {
                        floors.add(l)
                    }
                } else {
                    floors.add("0") // '0' is the default and is thus _always_ present
                }
            }
            const sorted = Array.from(floors)
            // Sort alphabetically first, to deal with floor "A", "B" and "C"
            sorted.sort()
            sorted.sort((a, b) => {
                // We use the laxer 'parseInt' to deal with floor '1A'
                const na = parseInt(a)
                const nb = parseInt(b)
                if (isNaN(na) || isNaN(nb)) {
                    return 0
                }
                return na - nb
            })
            sorted.reverse(/* new list, no side-effects */)
            return sorted
        })

        const lastClick = (this.lastClickObject = new LastClickFeatureSource(
            this.mapProperties.lastClickLocation,
            this.layout
        ))

        this.osmObjectDownloader = new OsmObjectDownloader(
            this.osmConnection.Backend(),
            this.changes
        )

        this.showNormalDataOn(this.map)
        this.initActors()
        this.addLastClick(lastClick)
        this.drawSpecialLayers()
        this.initHotkeys()
        this.miscSetup()
        if (!Utils.runningFromConsole) {
            console.log("State setup completed", this)
        }
    }

    public showNormalDataOn(map: Store<MlMap>) {
        this.perLayer.forEach((fs) => {
            const doShowLayer = this.mapProperties.zoom.map(
                (z) =>
                    (fs.layer.isDisplayed?.data ?? true) && z >= (fs.layer.layerDef?.minzoom ?? 0),
                [fs.layer.isDisplayed]
            )

            if (
                !doShowLayer.data &&
                (this.featureSwitches.featureSwitchFilter.data === false || !fs.layer.layerDef.name)
            ) {
                /* This layer is hidden and there is no way to enable it (filterview is disabled or this layer doesn't show up in the filter view as the name is not defined)
                 *
                 * This means that we don't have to filter it, nor do we have to display it
                 * */
                return
            }
            const filtered = new FilteringFeatureSource(
                fs.layer,
                fs,
                (id) => this.featureProperties.getStore(id),
                this.layerState.globalFilters
            )

            new ShowDataLayer(map, {
                layer: fs.layer.layerDef,
                features: filtered,
                doShowLayer,
                selectedElement: this.selectedElement,
                selectedLayer: this.selectedLayer,
                fetchStore: (id) => this.featureProperties.getStore(id),
            })
        })
    }

    /**
     * Various small methods that need to be called
     */
    private miscSetup() {
        this.userRelatedState.markLayoutAsVisited(this.layout)

        this.selectedElement.addCallbackAndRunD((feature) => {
            // As soon as we have a selected element, we clear the selected element
            // This is to work around maplibre, which'll _first_ register the click on the map and only _then_ on the feature
            // The only exception is if the last element is the 'add_new'-button, as we don't want it to disappear
            if (feature.properties.id === "last_click") {
                return
            }
            this.lastClickObject.features.setData([])
        })

        if (this.layout.customCss !== undefined && window.location.pathname.indexOf("theme") >= 0) {
            Utils.LoadCustomCss(this.layout.customCss)
        }
    }

    private initHotkeys() {
        Hotkeys.RegisterHotkey(
            {nomod: "Escape", onUp: true},
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

        Hotkeys.RegisterHotkey(
            {shift: "O"},
            Translations.t.hotkeyDocumentation.selectMapnik,
            () => {
                this.mapProperties.rasterLayer.setData(AvailableRasterLayers.osmCarto)
            }
        )
        const setLayerCategory = (category: EliCategory) => {
            const available = this.availableLayers.data
            const current = this.mapProperties.rasterLayer
            const best = RasterLayerUtils.SelectBestLayerAccordingTo(
                available,
                category,
                current.data
            )
            console.log("Best layer for category", category, "is", best.properties.id)
            current.setData(best)
        }

        Hotkeys.RegisterHotkey(
            {nomod: "O"},
            Translations.t.hotkeyDocumentation.selectOsmbasedmap,
            () => setLayerCategory("osmbasedmap")
        )

        Hotkeys.RegisterHotkey({nomod: "M"}, Translations.t.hotkeyDocumentation.selectMap, () =>
            setLayerCategory("map")
        )

        Hotkeys.RegisterHotkey(
            {nomod: "P"},
            Translations.t.hotkeyDocumentation.selectAerial,
            () => setLayerCategory("photo")
        )
    }

    private addLastClick(last_click: LastClickFeatureSource) {
        // The last_click gets a _very_ special treatment as it interacts with various parts

        const last_click_layer = this.layerState.filteredLayers.get("last_click")
        this.featureProperties.trackFeatureSource(last_click)
        this.indexedFeatures.addSource(last_click)

        last_click.features.addCallbackAndRunD((features) => {
            if (this.selectedLayer.data?.id === "last_click") {
                // The last-click location moved, but we have selected the last click of the previous location
                // So, we update _after_ clearing the selection to make sure no stray data is sticking around
                this.selectedElement.setData(undefined)
                this.selectedElement.setData(features[0])
            }
        })

        new ShowDataLayer(this.map, {
            features: new FilteringFeatureSource(last_click_layer, last_click),
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
                // We first clear the selection to make sure no weird state is around
                this.selectedLayer.setData(undefined)
                this.selectedElement.setData(undefined)

                this.selectedElement.setData(feature)
                this.selectedLayer.setData(last_click_layer.layerDef)
            },
        })
    }

    /**
     * Add the special layers to the map
     */
    private drawSpecialLayers() {
        type AddedByDefaultTypes = typeof Constants.added_by_default[number]
        const empty = []
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
                    bbox === undefined ? empty : <Feature[]>[bbox.asGeoJson({id: "range"})]
                )
            ),
            current_view: this.currentView
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
        const currentViewLayer = this.layout.layers.find(l => l.id === "current_view")
        if (currentViewLayer?.tagRenderings?.length > 0) {
            const params = MetaTagging.createExtraFuncParams(this)
            this.featureProperties.trackFeatureSource(specialLayers.current_view)
            specialLayers.current_view.features.addCallbackAndRunD(features => {
                MetaTagging.addMetatags(features, params, currentViewLayer, this.layout, this.osmObjectDownloader, this.featureProperties)
            })
        }

        this.layerState.filteredLayers
            .get("range")
            ?.isDisplayed?.syncWith(this.featureSwitches.featureSwitchIsTesting, true)

        this.layerState.filteredLayers.forEach((flayer) => {
            const id = flayer.layerDef.id
            const features: FeatureSource = specialLayers[id]
            if (features === undefined) {
                return
            }

            this.featureProperties.trackFeatureSource(features)
            //  this.indexedFeatures.addSource(features)
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
     */
    private initActors() {
        {
            // Unselect the selected element if it is panned out of view
            this.mapProperties.bounds.stabilized(250).addCallbackD((bounds) => {
                const selected = this.selectedElement.data
                if (selected === undefined) {
                    return
                }
                const bbox = BBox.get(selected)
                if (!bbox.overlapsWith(bounds)) {
                    this.selectedElement.setData(undefined)
                }
            })
        }
        {
            this.selectedElement.addCallback(selected => {
                if (selected === undefined) {
                    // We did _unselect_ an item - we always remove the lastclick-object
                    this.lastClickObject.features.setData([])
                    this.selectedLayer.setData(undefined)
                }
            })
        }
        new ThemeViewStateHashActor(this)
        new MetaTagging(this)
        new TitleHandler(this.selectedElement, this.selectedLayer, this.featureProperties, this)
        new ChangeToElementsActor(this.changes, this.featureProperties)
        new PendingChangesUploader(this.changes, this.selectedElement)
        new SelectedElementTagsUpdater(this)
        new BackgroundLayerResetter(this.mapProperties.rasterLayer, this.availableLayers)
    }
}
