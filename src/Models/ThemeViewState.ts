import LayoutConfig from "./ThemeConfig/LayoutConfig"
import { SpecialVisualizationState } from "../UI/SpecialVisualization"
import { Changes } from "../Logic/Osm/Changes"
import { Store, UIEventSource } from "../Logic/UIEventSource"
import {
    FeatureSource,
    IndexedFeatureSource,
    WritableFeatureSource,
} from "../Logic/FeatureSource/FeatureSource"
import { OsmConnection } from "../Logic/Osm/OsmConnection"
import { ExportableMap, MapProperties } from "./MapProperties"
import LayerState from "../Logic/State/LayerState"
import { Feature, Point, Polygon } from "geojson"
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
import { AvailableRasterLayers, RasterLayerPolygon, RasterLayerUtils } from "./RasterLayers"
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
import { BBox } from "../Logic/BBox"
import Constants from "./Constants"
import Hotkeys from "../UI/Base/Hotkeys"
import Translations from "../UI/i18n/Translations"
import { GeoIndexedStoreForLayer } from "../Logic/FeatureSource/Actors/GeoIndexedStore"
import { LastClickFeatureSource } from "../Logic/FeatureSource/Sources/LastClickFeatureSource"
import { MenuState } from "./MenuState"
import MetaTagging from "../Logic/MetaTagging"
import ChangeGeometryApplicator from "../Logic/FeatureSource/Sources/ChangeGeometryApplicator"
import { NewGeometryFromChangesFeatureSource } from "../Logic/FeatureSource/Sources/NewGeometryFromChangesFeatureSource"
import OsmObjectDownloader from "../Logic/Osm/OsmObjectDownloader"
import ShowOverlayRasterLayer from "../UI/Map/ShowOverlayRasterLayer"
import { Utils } from "../Utils"
import { EliCategory } from "./RasterLayerProperties"
import BackgroundLayerResetter from "../Logic/Actors/BackgroundLayerResetter"
import SaveFeatureSourceToLocalStorage from "../Logic/FeatureSource/Actors/SaveFeatureSourceToLocalStorage"
import BBoxFeatureSource from "../Logic/FeatureSource/Sources/TouchesBboxFeatureSource"
import ThemeViewStateHashActor from "../Logic/Web/ThemeViewStateHashActor"
import NoElementsInViewDetector, {
    FeatureViewState,
} from "../Logic/Actors/NoElementsInViewDetector"
import FilteredLayer from "./FilteredLayer"
import { PreferredRasterLayerSelector } from "../Logic/Actors/PreferredRasterLayerSelector"
import { ImageUploadManager } from "../Logic/ImageProviders/ImageUploadManager"
import { Imgur } from "../Logic/ImageProviders/Imgur"
import NearbyFeatureSource from "../Logic/FeatureSource/Sources/NearbyFeatureSource"
import FavouritesFeatureSource from "../Logic/FeatureSource/Sources/FavouritesFeatureSource"
import { ProvidedImage } from "../Logic/ImageProviders/ImageProvider"
import { GeolocationControlState } from "../UI/BigComponents/GeolocationControl"
import Zoomcontrol from "../UI/Zoomcontrol"
import {
    SummaryTileSource,
    SummaryTileSourceRewriter,
} from "../Logic/FeatureSource/TiledFeatureSource/SummaryTileSource"
import summaryLayer from "../assets/generated/layers/summary.json"
import { LayerConfigJson } from "./ThemeConfig/Json/LayerConfigJson"
import Locale from "../UI/i18n/Locale"
import Hash from "../Logic/Web/Hash"

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
    readonly mapProperties: MapLibreAdaptor & MapProperties & ExportableMap
    readonly osmObjectDownloader: OsmObjectDownloader

    readonly dataIsLoading: Store<boolean>
    /**
     * Indicates if there is _some_ data in view, even if it is not shown due to the filters
     */
    readonly hasDataInView: Store<FeatureViewState>

    readonly guistate: MenuState
    readonly fullNodeDatabase?: FullNodeDatabaseSource

    readonly historicalUserLocations: WritableFeatureSource<Feature<Point>>
    readonly indexedFeatures: IndexedFeatureSource & LayoutSource
    readonly currentView: FeatureSource<Feature<Polygon>>
    readonly featuresInView: FeatureSource
    readonly favourites: FavouritesFeatureSource
    /**
     * Contains a few (<10) >features that are near the center of the map.
     */
    readonly closestFeatures: NearbyFeatureSource
    readonly newFeatures: WritableFeatureSource
    readonly layerState: LayerState
    readonly featureSummary: SummaryTileSourceRewriter
    readonly perLayer: ReadonlyMap<string, GeoIndexedStoreForLayer>
    readonly perLayerFiltered: ReadonlyMap<string, FilteringFeatureSource>

    readonly availableLayers: Store<RasterLayerPolygon[]>
    readonly userRelatedState: UserRelatedState
    readonly geolocation: GeoLocationHandler
    readonly geolocationControl: GeolocationControlState

    readonly imageUploadManager: ImageUploadManager
    readonly previewedImage = new UIEventSource<ProvidedImage>(undefined)

    readonly addNewPoint: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    /**
     * When using arrow keys to move, the accessibility mode is activated, which has a small rectangle set.
     * This is the 'viewport' which 'closestFeatures' uses to filter wilt
     */
    readonly visualFeedbackViewportBounds: UIEventSource<BBox> = new UIEventSource<BBox>(undefined)

    readonly lastClickObject: LastClickFeatureSource
    readonly overlayLayerStates: ReadonlyMap<
        string,
        { readonly isDisplayed: UIEventSource<boolean> }
    >
    /**
     * All 'level'-tags that are available with the current features
     */
    readonly floors: Store<string[]>
    /**
     * If true, the user interface will toggle some extra aids for people using screenreaders and keyboard navigation
     * Triggered by navigating the map with arrows or by pressing 'space' or 'enter'
     */
    public readonly visualFeedback: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    public readonly toCacheSavers: ReadonlyMap<string, SaveFeatureSourceToLocalStorage>

    constructor(layout: LayoutConfig, mvtAvailableLayers: Set<string>) {
        Utils.initDomPurify()
        this.layout = layout
        this.featureSwitches = new FeatureSwitchState(layout)
        this.guistate = new MenuState(
            this.featureSwitches.featureSwitchWelcomeMessage.data,
            layout.id
        )
        this.map = new UIEventSource<MlMap>(undefined)
        const initial = new InitialMapPositioning(layout)
        this.mapProperties = new MapLibreAdaptor(this.map, initial)

        const geolocationState = new GeoLocationState()

        this.featureSwitchIsTesting = this.featureSwitches.featureSwitchIsTesting
        this.featureSwitchUserbadge = this.featureSwitches.featureSwitchEnableLogin

        this.osmConnection = new OsmConnection({
            dryRun: this.featureSwitches.featureSwitchIsTesting,
            fakeUser: this.featureSwitches.featureSwitchFakeUser.data,
            oauth_token: QueryParameters.GetQueryParameter(
                "oauth_token",
                undefined,
                "Used to complete the login"
            ),
        })
        this.userRelatedState = new UserRelatedState(
            this.osmConnection,
            layout,
            this.featureSwitches,
            this.mapProperties
        )
        this.userRelatedState.fixateNorth.addCallbackAndRunD((fixated) => {
            this.mapProperties.allowRotating.setData(fixated !== "yes")
        })
        this.selectedElement = new UIEventSource<Feature | undefined>(undefined, "Selected element")

        this.geolocation = new GeoLocationHandler(
            geolocationState,
            this.selectedElement,
            this.mapProperties,
            this.userRelatedState.gpsLocationHistoryRetentionTime
        )
        this.geolocationControl = new GeolocationControlState(this.geolocation, this.mapProperties)

        this.availableLayers = AvailableRasterLayers.layersAvailableAt(
            this.mapProperties.location,
            this.osmConnection.isLoggedIn
        )

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
                const state = { isDisplayed }
                overlayLayerStates.set(rasterInfo.id, state)
                new ShowOverlayRasterLayer(rasterInfo, this.map, this.mapProperties, state)
            }
            this.overlayLayerStates = overlayLayerStates
        }

        {
            /* Setup the layout source
             * A bit tricky, as this is heavily intertwined with the 'changes'-element, which generate a stream of new and changed features too
             */

            if (this.layout.layers.some((l) => l._needsFullNodeDatabase)) {
                this.fullNodeDatabase = new FullNodeDatabaseSource()
            }

            const layoutSource = new LayoutSource(
                layout.layers,
                this.featureSwitches,
                this.mapProperties,
                this.osmConnection.Backend(),
                (id) => self.layerState.filteredLayers.get(id).isDisplayed,
                mvtAvailableLayers,
                this.fullNodeDatabase
            )

            let currentViewIndex = 0
            const empty = []
            this.currentView = new StaticFeatureSource(
                this.mapProperties.bounds.map((bbox) => {
                    if (!bbox) {
                        return empty
                    }
                    currentViewIndex++
                    return <Feature[]>[
                        bbox.asGeoJson({
                            zoom: this.mapProperties.zoom.data,
                            ...this.mapProperties.location.data,
                            id: "current_view_" + currentViewIndex,
                        }),
                    ]
                })
            )
            this.featuresInView = new BBoxFeatureSource(layoutSource, this.mapProperties.bounds)

            this.dataIsLoading = layoutSource.isLoading
            this.indexedFeatures = layoutSource
            this.featureProperties = new FeaturePropertiesStore(layoutSource)

            this.changes = new Changes(
                {
                    dryRun: this.featureSwitches.featureSwitchIsTesting,
                    allElements: layoutSource,
                    featurePropertiesStore: this.featureProperties,
                    osmConnection: this.osmConnection,
                    historicalUserLocations: this.geolocation.historicalUserLocations,
                    featureSwitches: this.featureSwitches
                },
                layout?.isLeftRightSensitive() ?? false
            )
            this.historicalUserLocations = this.geolocation.historicalUserLocations
            this.newFeatures = new NewGeometryFromChangesFeatureSource(
                this.changes,
                layoutSource,
                this.featureProperties
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

        this.floors = this.featuresInView.features.stabilized(500).map((features) => {
            if (!features) {
                return []
            }
            const floors = new Set<string>()
            for (const feature of features) {
                let level = feature.properties["_level"]
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

        this.lastClickObject = new LastClickFeatureSource(this.layout)

        this.osmObjectDownloader = new OsmObjectDownloader(
            this.osmConnection.Backend(),
            this.changes
        )

        this.perLayerFiltered = this.showNormalDataOn(this.map)
        this.closestFeatures = new NearbyFeatureSource(
            this.mapProperties.location,
            this.perLayerFiltered,
            {
                currentZoom: this.mapProperties.zoom,
                layerState: this.layerState,
                bounds: this.visualFeedbackViewportBounds,
            }
        )
        this.hasDataInView = new NoElementsInViewDetector(this).hasFeatureInView
        this.imageUploadManager = new ImageUploadManager(
            layout,
            Imgur.singleton,
            this.featureProperties,
            this.osmConnection,
            this.changes
        )
        this.favourites = new FavouritesFeatureSource(this)

        this.featureSummary = this.setupSummaryLayer()
        this.toCacheSavers = this.initSaveToLocalStorage()
        this.initActors()
        this.drawSpecialLayers()
        this.initHotkeys()
        this.miscSetup()
        this.focusOnMap()
        if (!Utils.runningFromConsole) {
            console.log("State setup completed", this)
        }
    }

    /* By focussing on the map, the keyboard panning and zoom with '+' and '+' works */
    public focusOnMap() {
        if (this.map.data) {
            this.map.data.getCanvas().focus()
            console.log("Focused on map")
            return
        }
        this.map.addCallbackAndRunD((map) => {
            map.on("load", () => {
                map.getCanvas().focus()
            })
            return true
        })
    }

    public initSaveToLocalStorage() {
        const toLocalStorage = new Map<string, SaveFeatureSourceToLocalStorage>()
        this.perLayer.forEach((fs, layerId) => {
            if (fs.layer.layerDef.source.geojsonSource !== undefined) {
                return // We don't cache external data layers
            }
            console.log("Setting up a local store feature sink for", layerId)
            const storage = new SaveFeatureSourceToLocalStorage(
                this.osmConnection.Backend(),
                fs.layer.layerDef.id,
                LayoutSource.fromCacheZoomLevel,
                fs,
                this.featureProperties,
                fs.layer.layerDef.maxAgeOfCache
            )
            toLocalStorage.set(layerId, storage)
        })
        return toLocalStorage
    }
    public showNormalDataOn(map: Store<MlMap>): ReadonlyMap<string, FilteringFeatureSource> {
        const filteringFeatureSource = new Map<string, FilteringFeatureSource>()
        this.perLayer.forEach((fs, layerName) => {
            const doShowLayer = this.mapProperties.zoom.map(
                (z) =>
                    (fs.layer.isDisplayed?.data ?? true) && z >= (fs.layer.layerDef?.minzoom ?? 0),
                [fs.layer.isDisplayed]
            )

            if (!doShowLayer.data && this.featureSwitches.featureSwitchFilter.data === false) {
                /* This layer is hidden and there is no way to enable it (filterview is disabled or this layer doesn't show up in the filter view as the name is not defined)
                 *
                 * This means that we don't have to filter it, nor do we have to display it
                 *
                 * Note: it is tempting to also permanently disable the layer if it is not visible _and_ the layer name is hidden.
                 * However, this is _not_ correct: the layer might be hidden because zoom is not enough. Zooming in more _will_ reveal the layer!
                 * */
                return
            }
            const filtered = new FilteringFeatureSource(
                fs.layer,
                fs,
                (id) => this.featureProperties.getStore(id),
                this.layerState.globalFilters
            )
            filteringFeatureSource.set(layerName, filtered)

            new ShowDataLayer(map, {
                layer: fs.layer.layerDef,
                features: filtered,
                doShowLayer,
                metaTags: this.userRelatedState.preferencesAsTags,
                selectedElement: this.selectedElement,
                fetchStore: (id) => this.featureProperties.getStore(id),
            })
        })
        return filteringFeatureSource
    }

    public openNewDialog() {
        this.selectedElement.setData(undefined)

        const { lon, lat } = this.mapProperties.location.data
        const feature = this.lastClickObject.createFeature(lon, lat)
        this.featureProperties.trackFeature(feature)
        this.selectedElement.setData(feature)
    }

    public showCurrentLocationOn(map: Store<MlMap>): ShowDataLayer {
        const id = "gps_location"
        const flayerGps = this.layerState.filteredLayers.get(id)
        const features = this.geolocation.currentUserLocation
        return new ShowDataLayer(map, {
            features,
            doShowLayer: flayerGps.isDisplayed,
            layer: flayerGps.layerDef,
            metaTags: this.userRelatedState.preferencesAsTags,
            selectedElement: this.selectedElement,
        })
    }

    /**
     * Various small methods that need to be called
     */
    private miscSetup() {
        this.userRelatedState.a11y.addCallbackAndRunD((a11y) => {
            if (a11y === "always") {
                this.visualFeedback.setData(true)
            } else if (a11y === "never") {
                this.visualFeedback.setData(false)
            }
        })
        this.mapProperties.onKeyNavigationEvent((keyEvent) => {
            if (this.userRelatedState.a11y.data === "never") {
                return
            }
            if (["north", "east", "south", "west"].indexOf(keyEvent.key) >= 0) {
                this.visualFeedback.setData(true)
                return true // Our job is done, unregister
            }
        })

        this.userRelatedState.markLayoutAsVisited(this.layout)

        this.selectedElement.addCallback((selected) => {
            if (selected === undefined) {
                Zoomcontrol.resetzoom()
            }
        })

        if (this.layout.customCss !== undefined && window.location.pathname.indexOf("theme") >= 0) {
            Utils.LoadCustomCss(this.layout.customCss)
        }

        Hash.hash.addCallbackAndRunD(hash => {
            if(hash === "current_view" || hash.match(/current_view_[0-9]+/)){
                this.selectCurrentView()
            }
        })
    }

    /**
     * Selects the feature that is 'i' closest to the map center
     * @param i
     * @private
     */
    private selectClosestAtCenter(i: number = 0) {
        if (this.userRelatedState.a11y.data !== "never") {
            this.visualFeedback.setData(true)
        }
        const toSelect = this.closestFeatures.features?.data?.[i]
        if (!toSelect) {
            window.requestAnimationFrame(() => {
                const toSelect = this.closestFeatures.features?.data?.[i]
                if (!toSelect) {
                    return
                }
                this.selectedElement.setData(undefined)
                this.selectedElement.setData(toSelect)
            })
            return
        }
        this.selectedElement.setData(undefined)
        this.selectedElement.setData(toSelect)
    }

    private initHotkeys() {
        const docs = Translations.t.hotkeyDocumentation
        Hotkeys.RegisterHotkey({ nomod: "Escape", onUp: true }, docs.closeSidebar, () => {
            if (this.previewedImage.data !== undefined) {
                this.previewedImage.setData(undefined)
                return
            }
            this.selectedElement.setData(undefined)
            this.guistate.closeAll()
            if (!this.guistate.isSomethingOpen()) {
                Zoomcontrol.resetzoom()
                this.focusOnMap()
            }
        })

        Hotkeys.RegisterHotkey({ nomod: "f" }, docs.selectFavourites, () => {
            this.guistate.menuViewTab.setData("favourites")
            this.guistate.menuIsOpened.setData(true)
        })

        Hotkeys.RegisterHotkey(
            {
                nomod: " ",
                onUp: true,
            },
            docs.selectItem,
            () => {
                if (this.selectedElement.data !== undefined) {
                    return false
                }
                if (
                    this.guistate.menuIsOpened.data ||
                    this.guistate.themeIsOpened.data ||
                    this.previewedImage.data !== undefined
                ) {
                    return
                }
                this.selectClosestAtCenter(0)
            }
        )

        for (let i = 1; i < 9; i++) {
            let doc = docs.selectItemI.Subs({ i })
            if (i === 1) {
                doc = docs.selectItem
            } else if (i === 2) {
                doc = docs.selectItem2
            } else if (i === 3) {
                doc = docs.selectItem3
            }
            Hotkeys.RegisterHotkey(
                {
                    nomod: "" + i,
                    onUp: true,
                },
                doc,
                () => this.selectClosestAtCenter(i - 1)
            )
        }

        this.featureSwitches.featureSwitchBackgroundSelection.addCallbackAndRun((enable) => {
            if (!enable) {
                return
            }
            Hotkeys.RegisterHotkey(
                {
                    nomod: "b",
                },
                docs.openLayersPanel,
                () => {
                    if (this.featureSwitches.featureSwitchBackgroundSelection.data) {
                        this.guistate.backgroundLayerSelectionIsOpened.setData(true)
                    }
                }
            )
            Hotkeys.RegisterHotkey(
                {
                    nomod: "s",
                },
                Translations.t.hotkeyDocumentation.openFilterPanel,
                () => {
                    console.log("S pressed")
                    if (this.featureSwitches.featureSwitchFilter.data) {
                        this.guistate.openFilterView()
                    }
                }
            )
            Hotkeys.RegisterHotkey(
                { shift: "O" },
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
                { nomod: "O" },
                Translations.t.hotkeyDocumentation.selectOsmbasedmap,
                () => setLayerCategory("osmbasedmap")
            )

            Hotkeys.RegisterHotkey(
                { nomod: "M" },
                Translations.t.hotkeyDocumentation.selectMap,
                () => setLayerCategory("map")
            )

            Hotkeys.RegisterHotkey(
                { nomod: "P" },
                Translations.t.hotkeyDocumentation.selectAerial,
                () => setLayerCategory("photo")
            )
            Hotkeys.RegisterHotkey(
                { nomod: "L" },
                Translations.t.hotkeyDocumentation.geolocate,
                () => {
                    this.geolocationControl.handleClick()
                }
            )
            return true
        })

        Hotkeys.RegisterHotkey(
            {
                shift: "T",
            },
            Translations.t.hotkeyDocumentation.translationMode,
            () => {
                Locale.showLinkToWeblate.setData(!Locale.showLinkToWeblate.data)
            }
        )
    }

    private setupSummaryLayer(): SummaryTileSourceRewriter {
        /**
         * MaxZoom for the summary layer
         */
        const normalLayers = this.layout.layers.filter(
            (l) =>
                Constants.priviliged_layers.indexOf(<any>l.id) < 0 &&
                !l.id.startsWith("note_import")
        )
        const maxzoom = Math.min(...normalLayers.map((l) => l.minzoom))

        const layers = this.layout.layers.filter(
            (l) =>
                Constants.priviliged_layers.indexOf(<any>l.id) < 0 &&
                l.source.geojsonSource === undefined &&
                l.doCount
        )
        const url = new URL(Constants.VectorTileServer)
        const summaryTileSource = new SummaryTileSource(
            url.protocol + "//" + url.host + "/summary",
            layers.map((l) => l.id),
            this.mapProperties.zoom.map((z) => Math.max(Math.floor(z), 0)),
            this.mapProperties,
            {
                isActive: this.mapProperties.zoom.map((z) => z <= maxzoom),
            }
        )
        return new SummaryTileSourceRewriter(summaryTileSource, this.layerState.filteredLayers)
    }

    /**
     * Add the special layers to the map
     */
    private drawSpecialLayers() {
        type AddedByDefaultTypes = (typeof Constants.added_by_default)[number]
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
                    bbox === undefined ? empty : <Feature[]>[bbox.asGeoJson({ id: "range" })]
                )
            ),
            current_view: this.currentView,
            favourite: this.favourites,
            summary: this.featureSummary,
        }

        this.closestFeatures.registerSource(specialLayers.favourite, "favourite")
        if (this.layout?.lockLocation) {
            const bbox = new BBox(<any>this.layout.lockLocation)
            this.mapProperties.maxbounds.setData(bbox)
            ShowDataLayer.showRange(
                this.map,
                new StaticFeatureSource([bbox.asGeoJson({ id: "range" })]),
                this.featureSwitches.featureSwitchIsTesting
            )
        }
        const currentViewLayer = this.layout.layers.find((l) => l.id === "current_view")
        if (currentViewLayer?.tagRenderings?.length > 0) {
            const params = MetaTagging.createExtraFuncParams(this)
            this.featureProperties.trackFeatureSource(specialLayers.current_view)
            specialLayers.current_view.features.addCallbackAndRunD((features) => {
                MetaTagging.addMetatags(
                    features,
                    params,
                    currentViewLayer,
                    this.layout,
                    this.osmObjectDownloader,
                    this.featureProperties
                )
            })
        }

        const rangeFLayer: FilteredLayer = this.layerState.filteredLayers.get("range")
        const rangeIsDisplayed = rangeFLayer?.isDisplayed
        if (
            rangeFLayer &&
            !QueryParameters.wasInitialized(FilteredLayer.queryParameterKey(rangeFLayer.layerDef))
        ) {
            rangeIsDisplayed?.syncWith(this.featureSwitches.featureSwitchIsTesting, true)
        }

        // enumerate all 'normal' layers and match them with the appropriate 'special' layer - if applicable
        this.layerState.filteredLayers.forEach((flayer) => {
            const id = flayer.layerDef.id
            const features: FeatureSource = specialLayers[id]
            if (features === undefined) {
                return
            }
            if (id === "summary") {
                return
            }

            this.featureProperties.trackFeatureSource(features)
            new ShowDataLayer(this.map, {
                features,
                doShowLayer: flayer.isDisplayed,
                layer: flayer.layerDef,
                metaTags: this.userRelatedState.preferencesAsTags,
                selectedElement: this.selectedElement,
            })
        })

        new ShowDataLayer(this.map, {
            features: specialLayers.summary,
            layer: new LayerConfig(<LayerConfigJson>summaryLayer, "summaryLayer"),
            // doShowLayer: this.mapProperties.zoom.map((z) => z < maxzoom),
            selectedElement: this.selectedElement,
        })
    }

    /**
     * Setup various services for which no reference are needed
     */
    private initActors() {
        this.selectedElement.addCallback((selected) => {
            if (selected === undefined) {
                this.focusOnMap()
            }
        })
        this.guistate.allToggles.forEach((toggle) => {
            toggle.toggle.addCallbackD((isOpened) => {
                if (!isOpened) {
                    this.focusOnMap()
                }
            })
        })
        new ThemeViewStateHashActor(this)
        new MetaTagging(this)
        new TitleHandler(this.selectedElement, this.featureProperties, this)
        new ChangeToElementsActor(this.changes, this.featureProperties)
        new PendingChangesUploader(this.changes, this.selectedElement, this.imageUploadManager)
        new SelectedElementTagsUpdater(this)
        new BackgroundLayerResetter(this.mapProperties.rasterLayer, this.availableLayers)
        new PreferredRasterLayerSelector(
            this.mapProperties.rasterLayer,
            this.availableLayers,
            this.featureSwitches.backgroundLayerId,
            this.userRelatedState.preferredBackgroundLayer
        )
    }

    public selectCurrentView(){
        this.guistate.closeAll()
        this.selectedElement.setData(this.currentView.features?.data?.[0])
    }
}
