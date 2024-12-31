import ThemeConfig from "./ThemeConfig/ThemeConfig"
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
import ThemeSource from "../Logic/FeatureSource/Sources/ThemeSource"
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
import last_click_layerconfig from "../assets/generated/layers/last_click.json"

import { LayerConfigJson } from "./ThemeConfig/Json/LayerConfigJson"
import Hash from "../Logic/Web/Hash"
import { GeoOperations } from "../Logic/GeoOperations"
import { CombinedFetcher } from "../Logic/Web/NearbyImagesSearch"
import { GeocodeResult, GeocodingUtils } from "../Logic/Search/GeocodingProvider"
import SearchState from "../Logic/State/SearchState"
import { ShowDataLayerOptions } from "../UI/Map/ShowDataLayerOptions"
import { PanoramaxUploader } from "../Logic/ImageProviders/Panoramax"
import { Tag } from "../Logic/Tags/Tag"

/**
 *
 * The themeviewState contains all the state needed for the themeViewGUI.
 *
 * This is pretty much the 'brain' or the HQ of MapComplete
 *
 * It ties up all the needed elements and starts some actors.
 */
export default class ThemeViewState implements SpecialVisualizationState {
    readonly theme: ThemeConfig
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
    readonly indexedFeatures: IndexedFeatureSource & ThemeSource
    readonly currentView: FeatureSource<Feature<Polygon>>
    readonly featuresInView: FeatureSource
    readonly favourites: FavouritesFeatureSource
    /**
     * Contains a few (<10) >features that are near the center of the map.
     */
    readonly closestFeatures: NearbyFeatureSource
    readonly newFeatures: WritableFeatureSource
    readonly layerState: LayerState
    readonly perLayer: ReadonlyMap<string, GeoIndexedStoreForLayer>
    readonly perLayerFiltered: ReadonlyMap<string, FilteringFeatureSource>

    readonly availableLayers: { store: Store<RasterLayerPolygon[]> }
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

    public readonly nearbyImageSearcher: CombinedFetcher
    /**
     * Geocoded images that should be shown on the main map; probably only the currently hovered image
     */
    public readonly geocodedImages: UIEventSource<Feature[]> = new UIEventSource<Feature[]>([])

    public readonly searchState: SearchState
    /**
     * Used to check in the download panel if used
     */
    public readonly featureSummary: SummaryTileSourceRewriter

    constructor(layout: ThemeConfig, mvtAvailableLayers: Set<string>) {
        Utils.initDomPurify()
        this.theme = layout
        this.featureSwitches = new FeatureSwitchState(layout)
        this.guistate = new MenuState(
            this.featureSwitches.featureSwitchWelcomeMessage.data,
            layout.id
        )
        this.map = new UIEventSource<MlMap>(undefined)
        const geolocationState = new GeoLocationState()
        this.osmConnection = new OsmConnection({
            dryRun: this.featureSwitches.featureSwitchIsTesting,
            fakeUser: this.featureSwitches.featureSwitchFakeUser.data,
            oauth_token: QueryParameters.GetQueryParameter(
                "oauth_token",
                undefined,
                "Used to complete the login"
            ),
        })
        const initial = new InitialMapPositioning(layout, geolocationState, this.osmConnection)
        this.mapProperties = new MapLibreAdaptor(this.map, initial, { correctClick: 20 })

        this.featureSwitchIsTesting = this.featureSwitches.featureSwitchIsTesting
        this.featureSwitchUserbadge = this.featureSwitches.featureSwitchEnableLogin

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

        this.layerState = new LayerState(
            this.osmConnection,
            layout.layers,
            layout.id,
            this.featureSwitches.featureSwitchLayerDefault
        )

        {
            const overlayLayerStates = new Map<string, { isDisplayed: UIEventSource<boolean> }>()
            for (const rasterInfo of this.theme.tileLayerSources) {
                const isDisplayed = QueryParameters.GetBooleanQueryParameter(
                    "overlay-" + rasterInfo.id,
                    rasterInfo.defaultState ?? true,
                    "Whether or not overlay layer " + rasterInfo.id + " is shown"
                )
                const state = { isDisplayed }
                overlayLayerStates.set(rasterInfo.id, state)
                new ShowOverlayRasterLayer(rasterInfo, this.map, this.mapProperties, state)
            }
            this.overlayLayerStates = overlayLayerStates
        }

        {
            /* Set up the layout source
             * A bit tricky, as this is heavily intertwined with the 'changes'-element, which generates a stream of new and changed features too
             */

            if (this.theme.layers.some((l) => l._needsFullNodeDatabase)) {
                this.fullNodeDatabase = new FullNodeDatabaseSource()
            }

            const layoutSource = new ThemeSource(
                layout.layers,
                this.featureSwitches,
                this.mapProperties,
                this.osmConnection.Backend(),
                (id) => this.layerState.filteredLayers.get(id).isDisplayed,
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
                this,
                layout?.isLeftRightSensitive() ?? false,
                (e, extraMsg) => this.reportError(e, extraMsg)
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
                const level = feature.properties["_level"]
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

        this.lastClickObject = new LastClickFeatureSource(
            this.theme,
            this.mapProperties.lastClickLocation,
            this.userRelatedState.addNewFeatureMode
        )

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
                bounds: this.visualFeedbackViewportBounds.map(
                    (bounds) => bounds ?? this.mapProperties.bounds?.data,
                    [this.mapProperties.bounds]
                ),
            }
        )
        this.featureSummary = this.setupSummaryLayer()
        this.hasDataInView = new NoElementsInViewDetector(this).hasFeatureInView
        this.imageUploadManager = new ImageUploadManager(
            layout,
            new PanoramaxUploader(
                Constants.panoramax.url,
                Constants.panoramax.token,
                this.featureSwitchIsTesting.map((t) =>
                    t ? Constants.panoramax.testsequence : Constants.panoramax.sequence
                )
            ),
            this.featureProperties,
            this.osmConnection,
            this.changes,
            this.geolocation.geolocationState.currentGPSLocation,
            this.indexedFeatures,
            this.reportError
        )
        this.favourites = new FavouritesFeatureSource(this)
        const longAgo = new Date()
        longAgo.setTime(new Date().getTime() - 5 * 365 * 24 * 60 * 60 * 1000)
        this.nearbyImageSearcher = new CombinedFetcher(50, longAgo, this.indexedFeatures)

        this.toCacheSavers = layout.enableCache ? this.initSaveToLocalStorage() : undefined

        this.searchState = new SearchState(this)

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
            const storage = new SaveFeatureSourceToLocalStorage(
                this.osmConnection.Backend(),
                fs.layer.layerDef.id,
                ThemeSource.fromCacheZoomLevel,
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
                (z) => {
                    if (
                        (fs.layer.isDisplayed?.data ?? true) &&
                        z >= (fs.layer.layerDef?.minzoom ?? 0)
                    ) {
                        return true
                    }
                    if (this.layerState.globalFilters.data.some((f) => f.forceShowOnMatch)) {
                        return true
                    }
                    return false
                },
                [fs.layer.isDisplayed, this.layerState.globalFilters]
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
                this.layerState.globalFilters,
                undefined,
                this.mapProperties.zoom,
                this.selectedElement
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
        if (flayerGps === undefined) {
            return
        }
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

        this.userRelatedState.markLayoutAsVisited(this.theme)

        this.selectedElement.addCallback((selected) => {
            if (selected === undefined) {
                Zoomcontrol.resetzoom()
            }
        })

        if (this.theme.customCss !== undefined && window.location.pathname.indexOf("theme") >= 0) {
            Utils.LoadCustomCss(this.theme.customCss)
        }

        Hash.hash.addCallbackAndRunD((hash) => {
            if (hash === "current_view" || hash.match(/current_view_[0-9]+/)) {
                this.selectCurrentView()
            }
        })
    }

    private setSelectedElement(feature: Feature) {
        const current = this.selectedElement.data
        if (
            current?.properties?.id !== undefined &&
            current.properties.id === feature.properties.id
        ) {
            console.log("Not setting selected, same id", current, feature)
            return // already set
        }
        this.selectedElement.setData(feature)
    }

    /**
     * Selects the feature that is 'i' closest to the map center
     */
    private selectClosestAtCenter(i: number = 0) {
        console.log("Selecting closest", i)
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
                this.setSelectedElement(toSelect)
            })
            return
        }
        this.setSelectedElement(toSelect)
    }

    private initHotkeys() {
        const docs = Translations.t.hotkeyDocumentation
        Hotkeys.RegisterHotkey({ nomod: "Escape", onUp: true }, docs.closeSidebar, () => {
            if (this.previewedImage.data !== undefined) {
                this.previewedImage.setData(undefined)
                return
            }
            if (this.selectedElement.data) {
                this.selectedElement.setData(undefined)
                return
            }
            if (this.searchState.showSearchDrawer.data) {
                this.searchState.showSearchDrawer.set(false)
                return
            }
            if (this.guistate.closeAll()) {
                return
            }
            Zoomcontrol.resetzoom()
            this.focusOnMap()
        })

        Hotkeys.RegisterHotkey({ nomod: "f" }, docs.selectFavourites, () => {
            this.guistate.pageStates.favourites.set(true)
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
                if (this.guistate.isSomethingOpen() || this.previewedImage.data !== undefined) {
                    return
                }
                if (
                    document.activeElement.tagName === "button" ||
                    document.activeElement.tagName === "input"
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

        Hotkeys.RegisterHotkey(
            { ctrl: "F" },
            Translations.t.hotkeyDocumentation.selectSearch,
            () => {
                this.searchState.feedback.set(undefined)
                this.searchState.searchIsFocused.set(true)
            }
        )

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
                        this.guistate.pageStates.background.setData(true)
                    }
                }
            )
            Hotkeys.RegisterHotkey(
                {
                    nomod: "s",
                },
                Translations.t.hotkeyDocumentation.openFilterPanel,
                () => {
                    if (this.featureSwitches.featureSwitchFilter.data) {
                        this.guistate.openFilterView()
                    }
                }
            )
            const setLayerCategory = (category: EliCategory, skipLayers: number = 0) => {
                const timeOfCall = new Date()
                this.availableLayers.store.addCallbackAndRunD((available) => {
                    const now = new Date()
                    const timeDiff = (now.getTime() - timeOfCall.getTime()) / 1000
                    if (timeDiff > 3) {
                        return true // unregister
                    }
                    const current = this.mapProperties.rasterLayer
                    const best = RasterLayerUtils.SelectBestLayerAccordingTo(
                        available,
                        category,
                        current.data,
                        skipLayers
                    )
                    if (!best) {
                        return
                    }
                    console.log("Best layer for category", category, "is", best?.properties?.id)
                    current.setData(best)
                })
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
                { shift: "O" },
                Translations.t.hotkeyDocumentation.selectOsmbasedmap,
                () => setLayerCategory("osmbasedmap", 2)
            )

            Hotkeys.RegisterHotkey(
                { shift: "M" },
                Translations.t.hotkeyDocumentation.selectMap,
                () => setLayerCategory("map", 2)
            )

            Hotkeys.RegisterHotkey(
                { shift: "P" },
                Translations.t.hotkeyDocumentation.selectAerial,
                () => setLayerCategory("photo", 2)
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
                const tm = this.userRelatedState.translationMode
                if (tm.data === "false") {
                    tm.setData("true")
                } else {
                    tm.setData("false")
                }
            }
        )
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
                isActive: this.mapProperties.zoom.map((z) => z < maxzoom),
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
        const specialLayers: Record<AddedByDefaultTypes | "current_view", FeatureSource> = {
            home_location: this.userRelatedState.homeLocation,
            gps_location: this.geolocation.currentUserLocation,
            gps_location_history: this.geolocation.historicalUserLocations,
            gps_track: this.geolocation.historicalUserLocationsTrack,
            geocoded_image: new StaticFeatureSource(this.geocodedImages),
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
            last_click: this.lastClickObject,
            search: this.searchState.locationResults,
        }

        this.closestFeatures.registerSource(specialLayers.favourite, "favourite")
        if (this.theme?.lockLocation) {
            const bbox = new BBox(<[[number, number], [number, number]]>this.theme.lockLocation)
            this.mapProperties.maxbounds.setData(bbox)
            ShowDataLayer.showRange(
                this.map,
                new StaticFeatureSource([bbox.asGeoJson({ id: "range" })]),
                this.featureSwitches.featureSwitchIsTesting
            )
        }
        const currentViewLayer = this.theme.layers.find((l) => l.id === "current_view")
        if (currentViewLayer?.tagRenderings?.length > 0) {
            const params = MetaTagging.createExtraFuncParams(this)
            this.featureProperties.trackFeatureSource(specialLayers.current_view)
            specialLayers.current_view.features.addCallbackAndRunD((features) => {
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
            if (!features?.features) {
                return
            }
            if (id === "summary" || id === "last_click") {
                return
            }

            this.featureProperties.trackFeatureSource(features)
            const options: ShowDataLayerOptions & { layer: LayerConfig } = {
                features,
                doShowLayer: flayer.isDisplayed,
                layer: flayer.layerDef,
                metaTags: this.userRelatedState.preferencesAsTags,
                selectedElement: this.selectedElement,
            }
            if (flayer.layerDef.id === "search") {
                options.onClick = (feature) => {
                    this.searchState.clickedOnMap(feature)
                }
                delete options.selectedElement
            }
            new ShowDataLayer(this.map, options)
        })

        // last click
        {
            const lastClickLayerConfig = new LayerConfig(
                <LayerConfigJson>last_click_layerconfig,
                "last_click"
            )
            const lastClickFiltered =
                lastClickLayerConfig.isShown === undefined
                    ? specialLayers.last_click
                    : specialLayers.last_click.features.mapD((fs) =>
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
                        center: GeoOperations.centerpointCoordinates(feature),
                    })
                },
            })
        }

        if (specialLayers.summary) {
            new ShowDataLayer(this.map, {
                features: specialLayers.summary,
                layer: new LayerConfig(<LayerConfigJson>summaryLayer, "summaryLayer"),
                // doShowLayer: this.mapProperties.zoom.map((z) => z < maxzoom),
                selectedElement: this.selectedElement,
            })
        }
    }

    /**
     * Setup various services for which no reference are needed
     */
    private initActors() {
        if (!this.theme.official) {
            // Add custom themes to the "visited custom themes"
            const th = this.theme
            this.userRelatedState.addUnofficialTheme({
                id: th.id,
                icon: th.icon,
                title: th.title.translations,
                shortDescription: th.shortDescription.translations,
                layers: th.layers.filter((l) => l.isNormal()).map((l) => l.id),
            })
        }

        this.selectedElement.addCallback((selected) => {
            if (selected === undefined) {
                this.focusOnMap()
                this.geocodedImages.set([])
            } else {
                this.lastClickObject.clear()
            }
        })
        Object.values(this.guistate.pageStates).forEach((toggle) => {
            toggle.addCallbackD((isOpened) => {
                if (!isOpened) {
                    if (!this.guistate.isSomethingOpen()) {
                        this.focusOnMap()
                    }
                }
            })
        })

        // Add the selected element to the recently visited history
        this.selectedElement.addCallbackD((selected) => {
            const [osm_type, osm_id] = selected.properties.id.split("/")
            const [lon, lat] = GeoOperations.centerpointCoordinates(selected)
            const layer = this.theme.getMatchingLayer(selected.properties)

            const nameOptions = [
                selected?.properties?.name,
                selected?.properties?.alt_name,
                selected?.properties?.local_name,
                layer?.title.GetRenderValue(selected?.properties ?? {}).txt,
                selected.properties.display_name,
                selected.properties.id,
            ]
            const r = <GeocodeResult>{
                feature: selected,
                display_name: nameOptions.find((opt) => opt !== undefined),
                osm_id,
                osm_type,
                lon,
                lat,
            }
            this.userRelatedState.recentlyVisitedSearch.add(r)
        })

        this.mapProperties.lastClickLocation.addCallbackD((lastClick) => {
            if (lastClick.mode !== "left" || !lastClick.nearestFeature) {
                return
            }
            const f = lastClick.nearestFeature
            this.setSelectedElement(f)
        })

        this.userRelatedState.showScale.addCallbackAndRun((showScale) => {
            this.mapProperties.showScale.set(showScale)
        })

        this.layerState.filteredLayers
            .get("favourite")
            ?.isDisplayed?.addCallbackAndRunD((favouritesShown) => {
                const oldGlobal = this.layerState.globalFilters.data
                const key = "show-favourite"
                if (favouritesShown) {
                    this.layerState.globalFilters.set([
                        ...oldGlobal,
                        {
                            forceShowOnMatch: true,
                            id: key,
                            osmTags: new Tag("_favourite", "yes"),
                            state: 0,
                            onNewPoint: undefined,
                        },
                    ])
                } else {
                    this.layerState.globalFilters.set(oldGlobal.filter((gl) => gl.id !== key))
                }
            })

        new ThemeViewStateHashActor(this)
        new MetaTagging(this)
        new TitleHandler(this.selectedElement, this)
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

    public selectCurrentView() {
        this.guistate.closeAll()
        this.selectedElement.setData(this.currentView.features?.data?.[0])
    }

    /**
     * Searches the appropriate layer - will first try if a special layer matches; if not, a normal layer will be used by delegating to the theme
     */
    public getMatchingLayer(properties: Record<string, string>): LayerConfig | undefined {
        const id = properties.id

        if (id.startsWith("summary_")) {
            // We don't select 'summary'-objects
            return undefined
        }

        if (id === "settings") {
            return UserRelatedState.usersettingsConfig
        }
        if (id.startsWith(LastClickFeatureSource.newPointElementId)) {
            return this.theme.layers.find((l) => l.id === "last_click")
        }
        if (id.startsWith("search_result")) {
            return GeocodingUtils.searchLayer
        }
        if (id === "location_track") {
            return this.theme.layers.find((l) => l.id === "gps_track")
        }
        return this.theme.getMatchingLayer(properties)
    }

    public async reportError(message: string | Error | XMLHttpRequest, extramessage: string = "") {
        if (Utils.runningFromConsole) {
            console.error("Got (in themeViewSTate.reportError):", message, extramessage)
            return
        }
        const isTesting = this.featureSwitchIsTesting?.data
        console.log(
            isTesting
                ? ">>> _Not_ reporting error to report server as testmode is on"
                : ">>> Reporting error to",
            Constants.ErrorReportServer,
            message
        )
        if (isTesting) {
            return
        }

        if ("" + message === "[object XMLHttpRequest]") {
            const req = <XMLHttpRequest>message
            let body = ""
            try {
                body = req.responseText
            } catch (e) {
                // pass
            }
            message =
                "XMLHttpRequest with status code " +
                req.status +
                ", " +
                req.statusText +
                ", received: " +
                body
        }

        if (extramessage) {
            message += " (" + extramessage + ")"
        }

        const stacktrace: string = new Error().stack

        try {
            await fetch(Constants.ErrorReportServer, {
                method: "POST",
                body: JSON.stringify({
                    stacktrace,
                    message: "" + message,
                    theme: this.theme.id,
                    version: Constants.vNumber,
                    language: this.userRelatedState.language.data,
                    username: this.osmConnection.userDetails.data?.name,
                    userid: this.osmConnection.userDetails.data?.uid,
                    pendingChanges: this.changes.pendingChanges.data,
                    previousChanges: this.changes.allChanges.data,
                    changeRewrites: Utils.MapToObj(this.changes._changesetHandler._remappings),
                }),
            })
        } catch (e) {
            console.error("Could not upload an error report")
        }
    }
}
