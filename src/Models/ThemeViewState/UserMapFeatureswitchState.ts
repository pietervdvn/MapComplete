import ThemeConfig from "../ThemeConfig/ThemeConfig"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { Map as MlMap } from "maplibre-gl"
import { GeoLocationState } from "../../Logic/State/GeoLocationState"
import InitialMapPositioning from "../../Logic/Actors/InitialMapPositioning"
import { MapLibreAdaptor } from "../../UI/Map/MapLibreAdaptor"
import { ExportableMap, MapProperties } from "../MapProperties"
import { LastClickFeatureSource } from "../../Logic/FeatureSource/Sources/LastClickFeatureSource"
import { PreferredRasterLayerSelector } from "../../Logic/Actors/PreferredRasterLayerSelector"
import { AvailableRasterLayers, RasterLayerPolygon, RasterLayerUtils } from "../RasterLayers"
import BackgroundLayerResetter from "../../Logic/Actors/BackgroundLayerResetter"
import Hotkeys from "../../UI/Base/Hotkeys"
import Translations from "../../UI/i18n/Translations"
import { EliCategory } from "../RasterLayerProperties"
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource"
import { Feature, Point, Polygon } from "geojson"
import { FeatureSource, WritableFeatureSource } from "../../Logic/FeatureSource/FeatureSource"
import FullNodeDatabaseSource from "../../Logic/FeatureSource/TiledFeatureSource/FullNodeDatabaseSource"
import { WithUserRelatedState } from "./WithUserRelatedState"
import GeoLocationHandler from "../../Logic/Actors/GeoLocationHandler"
import { GeolocationControlState } from "../../UI/BigComponents/GeolocationControl"
import ShowOverlayRasterLayer from "../../UI/Map/ShowOverlayRasterLayer"
import { BBox } from "../../Logic/BBox"
import ShowDataLayer from "../../UI/Map/ShowDataLayer"

/**
 * The first core of the state management; everything related to:
 * - the OSM connection
 * - setting up the basemap
 * - the feature switches
 * - the GPS-location
 *
 * Anything that handles editable elements is _not_ done on this level.
 * Anything that handles the UI is not done on this level
 */

export class UserMapFeatureswitchState extends WithUserRelatedState {
    readonly map: UIEventSource<MlMap>

    readonly mapProperties: MapLibreAdaptor & MapProperties & ExportableMap
    readonly lastClickObject: LastClickFeatureSource

    readonly geolocationState: GeoLocationState
    readonly geolocation: GeoLocationHandler
    readonly geolocationControl: GeolocationControlState
    readonly historicalUserLocations: WritableFeatureSource<Feature<Point>>

    readonly availableLayers: { store: Store<RasterLayerPolygon[]> }
    readonly currentView: FeatureSource<Feature<Polygon>>
    readonly fullNodeDatabase?: FullNodeDatabaseSource

    constructor(theme: ThemeConfig, selectedElement: Store<object>) {
        const rasterLayer: UIEventSource<RasterLayerPolygon> =
            new UIEventSource<RasterLayerPolygon>(undefined)
        super(theme, rasterLayer)
        this.geolocationState = new GeoLocationState()
        const initial = new InitialMapPositioning(theme, this.geolocationState, this.osmConnection)
        this.map = new UIEventSource<MlMap>(undefined)
        this.mapProperties = new MapLibreAdaptor(
            this.map,
            { rasterLayer, ...initial },
            { correctClick: 20 }
        )

        this.geolocation = new GeoLocationHandler(
            this.geolocationState,
            selectedElement,
            this.mapProperties,
            this.userRelatedState.gpsLocationHistoryRetentionTime
        )
        this.geolocationControl = new GeolocationControlState(this.geolocation, this.mapProperties)
        this.historicalUserLocations = this.geolocation.historicalUserLocations

        this.userRelatedState.fixateNorth.addCallbackAndRunD((fixated) => {
            this.mapProperties.allowRotating.setData(fixated !== "yes")
        })

        this.availableLayers = AvailableRasterLayers.layersAvailableAt(
            this.mapProperties.location,
            this.osmConnection.isLoggedIn
        )

        this.userRelatedState.markLayoutAsVisited(this.theme)

        this.lastClickObject = new LastClickFeatureSource(
            this.theme,
            this.mapProperties.lastClickLocation,
            this.userRelatedState.addNewFeatureMode
        )
        {
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
        }

        if (this.theme.layers.some((l) => l._needsFullNodeDatabase)) {
            this.fullNodeDatabase = new FullNodeDatabaseSource()
        }

        ///////// Actors ///////////////

        new BackgroundLayerResetter(this.mapProperties.rasterLayer, this.availableLayers)

        this.userRelatedState.showScale.addCallbackAndRun((showScale) => {
            this.mapProperties.showScale.set(showScale)
        })
        new PreferredRasterLayerSelector(
            this.mapProperties.rasterLayer,
            this.availableLayers,
            this.featureSwitches.backgroundLayerId,
            this.userRelatedState.preferredBackgroundLayer
        )

        this.initHotkeys()
        this.drawOverlayLayers()
        this.drawLock()
    }

    /**
     * If the map is locked to a certain area _and_ we are in test mode, draw this on the map
     * @private
     */
    private drawLock() {
        if (!this.theme?.lockLocation) {
            return
        }
        const bbox = new BBox(<[[number, number], [number, number]]>this.theme.lockLocation)
        this.mapProperties.maxbounds.setData(bbox)
        ShowDataLayer.showRange(
            this.map,
            new StaticFeatureSource([bbox.asGeoJson({ id: "range" })]),
            this.featureSwitches.featureSwitchIsTesting
        )
    }

    private drawOverlayLayers() {
        for (const rasterInfo of this.theme.tileLayerSources) {
            const state = this.overlayLayerStates.get(rasterInfo.id)
            new ShowOverlayRasterLayer(rasterInfo, this.map, this.mapProperties, state)
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

    private initHotkeys() {
        const docs = Translations.t.hotkeyDocumentation

        this.featureSwitches.featureSwitchBackgroundSelection.addCallbackAndRun((enable) => {
            if (!enable) {
                return
            }

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

            Hotkeys.RegisterHotkey({ nomod: "O" }, docs.selectOsmbasedmap, () =>
                setLayerCategory("osmbasedmap")
            )

            Hotkeys.RegisterHotkey({ nomod: "M" }, docs.selectMap, () => setLayerCategory("map"))

            Hotkeys.RegisterHotkey({ nomod: "P" }, docs.selectAerial, () =>
                setLayerCategory("photo")
            )
            Hotkeys.RegisterHotkey({ shift: "O" }, docs.selectOsmbasedmap, () =>
                setLayerCategory("osmbasedmap", 2)
            )

            Hotkeys.RegisterHotkey({ shift: "M" }, docs.selectMap, () => setLayerCategory("map", 2))

            Hotkeys.RegisterHotkey({ shift: "P" }, docs.selectAerial, () =>
                setLayerCategory("photo", 2)
            )

            return true
        })

        Hotkeys.RegisterHotkey({ nomod: "L" }, Translations.t.hotkeyDocumentation.geolocate, () => {
            this.geolocationControl.handleClick()
        })

        Hotkeys.RegisterHotkey({ nomod: "H" }, Translations.t.hotkeyDocumentation.homeLocation, () => {
            const home = this.userRelatedState.osmConnection.userDetails.data?.home
            if (!home) {
                console.log("No home location set")
            }
            this.mapProperties.location.set(home)
        })

        Hotkeys.RegisterHotkey(
            {
                shift: "T",
            },
            docs.translationMode,
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

    /**
     * Shows the current GPS-location marker on the given map.
     * This is used to show the location on _other_ maps, e.g. on the map to add a new feature.
     *
     * This is _NOT_ to be used on the main map!
     */
    public showCurrentLocationOn(map: Store<MlMap>) {
        const id = "gps_location"
        const layer = this.theme.getLayer(id)
        if (layer === undefined) {
            return
        }
        if (map === this.map) {
            throw "Invalid use of showCurrentLocationOn"
        }
        const features = this.geolocation.currentUserLocation
        return new ShowDataLayer(map, {
            features,
            layer,
            metaTags: this.userRelatedState.preferencesAsTags,
        })
    }
}
