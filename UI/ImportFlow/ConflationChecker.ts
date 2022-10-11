import { BBox } from "../../Logic/BBox"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import Combine from "../Base/Combine"
import Title from "../Base/Title"
import { Overpass } from "../../Logic/Osm/Overpass"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import Constants from "../../Models/Constants"
import RelationsTracker from "../../Logic/Osm/RelationsTracker"
import { VariableUiElement } from "../Base/VariableUIElement"
import { FlowStep } from "./FlowStep"
import Loading from "../Base/Loading"
import { SubtleButton } from "../Base/SubtleButton"
import Svg from "../../Svg"
import { Utils } from "../../Utils"
import { IdbLocalStorage } from "../../Logic/Web/IdbLocalStorage"
import Minimap from "../Base/Minimap"
import BaseLayer from "../../Models/BaseLayer"
import AvailableBaseLayers from "../../Logic/Actors/AvailableBaseLayers"
import Loc from "../../Models/Loc"
import Attribution from "../BigComponents/Attribution"
import ShowDataLayer from "../ShowDataLayer/ShowDataLayer"
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource"
import ValidatedTextField from "../Input/ValidatedTextField"
import { LocalStorageSource } from "../../Logic/Web/LocalStorageSource"
import * as import_candidate from "../../assets/layers/import_candidate/import_candidate.json"
import { GeoOperations } from "../../Logic/GeoOperations"
import FeatureInfoBox from "../Popup/FeatureInfoBox"
import { ImportUtils } from "./ImportUtils"
import Translations from "../i18n/Translations"
import ShowDataMultiLayer from "../ShowDataLayer/ShowDataMultiLayer"
import FilteredLayer, { FilterState } from "../../Models/FilteredLayer"
import { Feature, FeatureCollection } from "@turf/turf"
import * as currentview from "../../assets/layers/current_view/current_view.json"
import { CheckBox } from "../Input/Checkboxes"
import BackgroundMapSwitch from "../BigComponents/BackgroundMapSwitch"

/**
 * Given the data to import, the bbox and the layer, will query overpass for similar items
 */
export default class ConflationChecker
    extends Combine
    implements FlowStep<{ features: any[]; theme: string }>
{
    public readonly IsValid
    public readonly Value: Store<{ features: any[]; theme: string }>

    constructor(state, params: { bbox: BBox; layer: LayerConfig; theme: string; features: any[] }) {
        const t = Translations.t.importHelper.conflationChecker

        const bbox = params.bbox.padAbsolute(0.0001)
        const layer = params.layer

        const toImport: { features: any[] } = params
        let overpassStatus = new UIEventSource<
            { error: string } | "running" | "success" | "idle" | "cached"
        >("idle")

        function loadDataFromOverpass() {
            // Load the data!
            const url = Constants.defaultOverpassUrls[1]
            const relationTracker = new RelationsTracker()
            const overpass = new Overpass(
                params.layer.source.osmTags,
                [],
                url,
                new UIEventSource<number>(180),
                relationTracker,
                true
            )
            console.log("Loading from overpass!")
            overpassStatus.setData("running")
            overpass.queryGeoJson(bbox).then(
                ([data, date]) => {
                    console.log(
                        "Received overpass-data: ",
                        data.features.length,
                        "features are loaded at ",
                        date
                    )
                    overpassStatus.setData("success")
                    fromLocalStorage.setData([data, date])
                },
                (error) => {
                    overpassStatus.setData({ error })
                }
            )
        }

        const fromLocalStorage = IdbLocalStorage.Get<[any, Date]>(
            "importer-overpass-cache-" + layer.id,
            {
                whenLoaded: (v) => {
                    if (v !== undefined && v !== null) {
                        console.log("Loaded from local storage:", v)
                        overpassStatus.setData("cached")
                    } else {
                        loadDataFromOverpass()
                    }
                },
            }
        )

        const cacheAge = fromLocalStorage.map((d) => {
            if (d === undefined || d[1] === undefined) {
                return undefined
            }
            const [_, loadedDate] = d
            return (new Date().getTime() - loadedDate.getTime()) / 1000
        })
        cacheAge.addCallbackD((timeDiff) => {
            if (timeDiff < 24 * 60 * 60) {
                // Recently cached!
                overpassStatus.setData("cached")
                return
            } else {
                loadDataFromOverpass()
            }
        })

        const geojson: Store<FeatureCollection> = fromLocalStorage.map((d) => {
            if (d === undefined) {
                return undefined
            }
            return d[0]
        })

        const background = new UIEventSource<BaseLayer>(AvailableBaseLayers.osmCarto)
        const location = new UIEventSource<Loc>({ lat: 0, lon: 0, zoom: 1 })
        const currentBounds = new UIEventSource<BBox>(undefined)
        const zoomLevel = ValidatedTextField.ForType("pnat").ConstructInputElement({
            value: LocalStorageSource.GetParsed<string>("importer-zoom-level", "0"),
        })
        zoomLevel.SetClass("ml-1 border border-black")
        const osmLiveData = Minimap.createMiniMap({
            allowMoving: true,
            location,
            background,
            bounds: currentBounds,
            attribution: new Attribution(
                location,
                state.osmConnection.userDetails,
                undefined,
                currentBounds
            ),
        })
        osmLiveData.SetClass("w-full").SetStyle("height: 500px")

        const geojsonFeatures: Store<Feature[]> = geojson.map(
            (geojson) => {
                if (geojson?.features === undefined) {
                    return []
                }
                const currentZoom = zoomLevel.GetValue().data
                const zoomedEnough: boolean = osmLiveData.location.data.zoom >= Number(currentZoom)
                if (currentZoom !== undefined && !zoomedEnough) {
                    return []
                }
                const bounds = osmLiveData.bounds.data
                if (bounds === undefined) {
                    return geojson.features
                }
                return geojson.features.filter((f) => BBox.get(f).overlapsWith(bounds))
            },
            [osmLiveData.bounds, zoomLevel.GetValue()]
        )

        const preview = StaticFeatureSource.fromGeojsonStore(geojsonFeatures)

        new ShowDataLayer({
            layerToShow: new LayerConfig(currentview),
            state,
            leafletMap: osmLiveData.leafletMap,
            popup: undefined,
            zoomToFeatures: true,
            features: StaticFeatureSource.fromGeojson([bbox.asGeoJson({})]),
        })

        new ShowDataMultiLayer({
            //layerToShow: layer,
            layers: new UIEventSource<FilteredLayer[]>([
                {
                    layerDef: layer,
                    isDisplayed: new UIEventSource<boolean>(true),
                    appliedFilters: new UIEventSource<Map<string, FilterState>>(undefined),
                },
            ]),
            state,
            leafletMap: osmLiveData.leafletMap,
            popup: (tags, layer) => new FeatureInfoBox(tags, layer, state, { setHash: false }),
            zoomToFeatures: false,
            features: preview,
        })

        new ShowDataLayer({
            layerToShow: new LayerConfig(import_candidate),
            state,
            leafletMap: osmLiveData.leafletMap,
            popup: (tags, layer) => new FeatureInfoBox(tags, layer, state, { setHash: false }),
            zoomToFeatures: false,
            features: StaticFeatureSource.fromGeojson(toImport.features),
        })

        const nearbyCutoff = ValidatedTextField.ForType("pnat").ConstructInputElement()
        nearbyCutoff.SetClass("ml-1 border border-black")
        nearbyCutoff.GetValue().syncWith(LocalStorageSource.Get("importer-cutoff", "25"), true)

        const matchedFeaturesMap = Minimap.createMiniMap({
            allowMoving: true,
            background,
        })
        matchedFeaturesMap.SetClass("w-full").SetStyle("height: 500px")

        // Featuresource showing OSM-features which are nearby a toImport-feature
        const geojsonMapped: Store<Feature[]> = geojson.map(
            (osmData) => {
                if (osmData?.features === undefined) {
                    return []
                }
                const maxDist = Number(nearbyCutoff.GetValue().data)
                return osmData.features.filter((f) =>
                    toImport.features.some(
                        (imp) =>
                            maxDist >=
                            GeoOperations.distanceBetween(
                                imp.geometry.coordinates,
                                GeoOperations.centerpointCoordinates(f)
                            )
                    )
                )
            },
            [nearbyCutoff.GetValue().stabilized(500)]
        )
        const nearbyFeatures = StaticFeatureSource.fromGeojsonStore(geojsonMapped)
        const paritionedImport = ImportUtils.partitionFeaturesIfNearby(
            toImport,
            geojson,
            nearbyCutoff.GetValue().map(Number)
        )

        // Featuresource showing OSM-features which are nearby a toImport-feature
        const toImportWithNearby = StaticFeatureSource.fromGeojsonStore(
            paritionedImport.map((els) => els?.hasNearby ?? [])
        )
        toImportWithNearby.features.addCallback((nearby) =>
            console.log("The following features are near an already existing object:", nearby)
        )

        new ShowDataLayer({
            layerToShow: new LayerConfig(import_candidate),
            state,
            leafletMap: matchedFeaturesMap.leafletMap,
            popup: (tags, layer) => new FeatureInfoBox(tags, layer, state, { setHash: false }),
            zoomToFeatures: false,
            features: toImportWithNearby,
        })
        const showOsmLayer = new CheckBox(t.showOsmLayerInConflationMap, true)
        new ShowDataLayer({
            layerToShow: layer,
            state,
            leafletMap: matchedFeaturesMap.leafletMap,
            popup: (tags, layer) => new FeatureInfoBox(tags, layer, state, { setHash: false }),
            zoomToFeatures: true,
            features: nearbyFeatures,
            doShowLayer: showOsmLayer.GetValue(),
        })

        const conflationMaps = new Combine([
            new VariableUiElement(
                geojson.map((geojson) => {
                    if (geojson === undefined) {
                        return undefined
                    }
                    return new SubtleButton(Svg.download_svg(), t.downloadOverpassData).onClick(
                        () => {
                            Utils.offerContentsAsDownloadableFile(
                                JSON.stringify(geojson, null, "  "),
                                "mapcomplete-" + layer.id + ".geojson",
                                {
                                    mimetype: "application/json+geo",
                                }
                            )
                        }
                    )
                })
            ),
            new VariableUiElement(
                cacheAge.map((age) => {
                    if (age === undefined) {
                        return undefined
                    }
                    if (age < 0) {
                        return t.cacheExpired
                    }
                    return new Combine([
                        t.loadedDataAge.Subs({ age: Utils.toHumanTime(age) }),
                        new SubtleButton(Svg.reload_svg().SetClass("h-8"), t.reloadTheCache)
                            .onClick(loadDataFromOverpass)
                            .SetClass("h-12"),
                    ])
                })
            ),

            new Title(t.titleLive),
            t.importCandidatesCount.Subs({ count: toImport.features.length }),
            new VariableUiElement(
                geojson.map((geojson) => {
                    if (
                        geojson?.features?.length === undefined ||
                        geojson?.features?.length === 0
                    ) {
                        return t.nothingLoaded.Subs(layer).SetClass("alert")
                    }
                    return new Combine([
                        t.osmLoaded.Subs({ count: geojson.features.length, name: layer.name }),
                    ])
                })
            ),
            osmLiveData,
            new Combine([
                t.zoomLevelSelection,
                zoomLevel,
                new VariableUiElement(
                    osmLiveData.location.map((location) => {
                        return t.zoomIn.Subs(<any>{ current: location.zoom })
                    })
                ),
            ]).SetClass("flex"),
            new Title(t.titleNearby),
            new Combine([t.mapShowingNearbyIntro, nearbyCutoff]).SetClass("flex"),
            new VariableUiElement(
                toImportWithNearby.features.map((feats) =>
                    t.nearbyWarn.Subs({ count: feats.length }).SetClass("alert")
                )
            ),
            t.setRangeToZero,
            matchedFeaturesMap,
            new Combine([
                new BackgroundMapSwitch(
                    { backgroundLayer: background, locationControl: matchedFeaturesMap.location },
                    background
                ),
                showOsmLayer,
            ]).SetClass("flex"),
        ]).SetClass("flex flex-col")
        super([
            new Title(t.title),
            new VariableUiElement(
                overpassStatus.map((d) => {
                    if (d === "idle") {
                        return new Loading(t.states.idle)
                    }
                    if (d === "running") {
                        return new Loading(t.states.running)
                    }
                    if (d["error"] !== undefined) {
                        return t.states.error.Subs({ error: d["error"] }).SetClass("alert")
                    }

                    if (d === "cached") {
                        return conflationMaps
                    }
                    if (d === "success") {
                        return conflationMaps
                    }
                    return t.states.unexpected.Subs({ state: d }).SetClass("alert")
                })
            ),
        ])

        this.Value = paritionedImport.map((feats) => ({
            theme: params.theme,
            features: feats?.noNearby,
            layer: params.layer,
        }))
        this.IsValid = this.Value.map((v) => v?.features !== undefined && v.features.length > 0)
    }
}
