import {BBox} from "../../Logic/BBox";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import Combine from "../Base/Combine";
import Title from "../Base/Title";
import {Overpass} from "../../Logic/Osm/Overpass";
import {UIEventSource} from "../../Logic/UIEventSource";
import Constants from "../../Models/Constants";
import RelationsTracker from "../../Logic/Osm/RelationsTracker";
import {VariableUiElement} from "../Base/VariableUIElement";
import {FixedUiElement} from "../Base/FixedUiElement";
import {FlowStep} from "./FlowStep";
import Loading from "../Base/Loading";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import {Utils} from "../../Utils";
import {IdbLocalStorage} from "../../Logic/Web/IdbLocalStorage";
import Minimap from "../Base/Minimap";
import BaseLayer from "../../Models/BaseLayer";
import AvailableBaseLayers from "../../Logic/Actors/AvailableBaseLayers";
import Loc from "../../Models/Loc";
import Attribution from "../BigComponents/Attribution";
import ShowDataLayer from "../ShowDataLayer/ShowDataLayer";
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource";
import ValidatedTextField from "../Input/ValidatedTextField";
import {LocalStorageSource} from "../../Logic/Web/LocalStorageSource";
import * as currentview from "../../assets/layers/current_view/current_view.json"
import * as import_candidate from "../../assets/layers/import_candidate/import_candidate.json"
import {GeoOperations} from "../../Logic/GeoOperations";
import FeatureInfoBox from "../Popup/FeatureInfoBox";
import {ImportUtils} from "./ImportUtils";

/**
 * Given the data to import, the bbox and the layer, will query overpass for similar items
 */
export default class ConflationChecker extends Combine implements FlowStep<{ features: any[], layer: LayerConfig }> {

    public readonly IsValid
    public readonly Value

    constructor(
        state,
        params: { bbox: BBox, layer: LayerConfig, geojson: any }) {


        const bbox = params.bbox.padAbsolute(0.0001)
        const layer = params.layer;
        const toImport = params.geojson;
        let overpassStatus = new UIEventSource<{ error: string } | "running" | "success" | "idle" | "cached">("idle")
        const cacheAge = new UIEventSource<number>(undefined);
        const fromLocalStorage = IdbLocalStorage.Get<[any, Date]>("importer-overpass-cache-" + layer.id, {
            whenLoaded: (v) => {
                if (v !== undefined) {
                    console.log("Loaded from local storage:", v)
                    const [geojson, date] = v;
                    const timeDiff = (new Date().getTime() - date.getTime()) / 1000;
                    console.log("Loaded ", geojson.features.length, " features; cache is ", timeDiff, "seconds old")
                    cacheAge.setData(timeDiff)
                    if (timeDiff < 24 * 60 * 60) {
                        // Recently cached! 
                        overpassStatus.setData("cached")
                        return;
                    }
                    cacheAge.setData(-1)
                }
                // Load the data!
                const url = Constants.defaultOverpassUrls[1]
                const relationTracker = new RelationsTracker()
                const overpass = new Overpass(params.layer.source.osmTags, [], url, new UIEventSource<number>(180), relationTracker, true)
                console.log("Loading from overpass!")
                overpassStatus.setData("running")
                overpass.queryGeoJson(bbox).then(
                    ([data, date]) => {
                        console.log("Received overpass-data: ", data.features.length, "features are loaded at ", date);
                        overpassStatus.setData("success")
                        fromLocalStorage.setData([data, date])
                    },
                    (error) => {
                        overpassStatus.setData({error})
                    })

            }
        });


        const geojson: UIEventSource<any> = fromLocalStorage.map(d => {
            if (d === undefined) {
                return undefined
            }
            return d[0]
        })

        const background = new UIEventSource<BaseLayer>(AvailableBaseLayers.osmCarto)
        const location = new UIEventSource<Loc>({lat: 0, lon: 0, zoom: 1})
        const currentBounds = new UIEventSource<BBox>(undefined)
        const zoomLevel = ValidatedTextField.ForType("pnat").ConstructInputElement()
        zoomLevel.SetClass("ml-1 border border-black")
        zoomLevel.GetValue().syncWith(LocalStorageSource.Get("importer-zoom-level", "14"), true)
        const osmLiveData = Minimap.createMiniMap({
            allowMoving: true,
            location,
            background,
            bounds: currentBounds,
            attribution: new Attribution(location, state.osmConnection.userDetails, undefined, currentBounds)
        })
        osmLiveData.SetClass("w-full").SetStyle("height: 500px")
        const preview = new StaticFeatureSource(geojson.map(geojson => {
            if (geojson?.features === undefined) {
                return []
            }
            const zoomedEnough: boolean = osmLiveData.location.data.zoom >= Number(zoomLevel.GetValue().data)
            if (!zoomedEnough) {
                return []
            }
            const bounds = osmLiveData.bounds.data
            return geojson.features.filter(f => BBox.get(f).overlapsWith(bounds))
        }, [osmLiveData.bounds, zoomLevel.GetValue()]), false);


        new ShowDataLayer({
            layerToShow: new LayerConfig(currentview),
            state,
            leafletMap: osmLiveData.leafletMap,
            popup: undefined,
            zoomToFeatures: true,
            features: new StaticFeatureSource([
                bbox.asGeoJson({})
            ], false)
        })


        new ShowDataLayer({
            layerToShow: layer,
            state,
            leafletMap: osmLiveData.leafletMap,
            popup: (tags, layer) => new FeatureInfoBox(tags, layer, state),
            zoomToFeatures: false,
            features: preview
        })

        new ShowDataLayer({
            layerToShow: new LayerConfig(import_candidate),
            state,
            leafletMap: osmLiveData.leafletMap,
            popup: (tags, layer) => new FeatureInfoBox(tags, layer, state),
            zoomToFeatures: false,
            features: new StaticFeatureSource(toImport.features, false)
        })

        const nearbyCutoff = ValidatedTextField.ForType("pnat").ConstructInputElement()
        nearbyCutoff.SetClass("ml-1 border border-black")
        nearbyCutoff.GetValue().syncWith(LocalStorageSource.Get("importer-cutoff", "25"), true)

        const matchedFeaturesMap = Minimap.createMiniMap({
            allowMoving: true,
            background
        })
        matchedFeaturesMap.SetClass("w-full").SetStyle("height: 500px")

        // Featuresource showing OSM-features which are nearby a toImport-feature 
        const nearbyFeatures = new StaticFeatureSource(geojson.map(osmData => {
            if (osmData?.features === undefined) {
                return []
            }
            const maxDist = Number(nearbyCutoff.GetValue().data)
            return osmData.features.filter(f =>
                toImport.features.some(imp =>
                    maxDist >= GeoOperations.distanceBetween(imp.geometry.coordinates, GeoOperations.centerpointCoordinates(f))))
        }, [nearbyCutoff.GetValue()]), false);
        const paritionedImport = ImportUtils.partitionFeaturesIfNearby(toImport, geojson, nearbyCutoff.GetValue().map(Number));

        // Featuresource showing OSM-features which are nearby a toImport-feature 
        const toImportWithNearby = new StaticFeatureSource(paritionedImport.map(els => els?.hasNearby ?? []), false);

        new ShowDataLayer({
            layerToShow: layer,
            state,
            leafletMap: matchedFeaturesMap.leafletMap,
            popup: (tags, layer) => new FeatureInfoBox(tags, layer, state),
            zoomToFeatures: true,
            features: nearbyFeatures
        })

        new ShowDataLayer({
            layerToShow: new LayerConfig(import_candidate),
            state,
            leafletMap: matchedFeaturesMap.leafletMap,
            popup: (tags, layer) => new FeatureInfoBox(tags, layer, state),
            zoomToFeatures: false,
            features: toImportWithNearby
        })


        const conflationMaps = new Combine([
            new VariableUiElement(
                geojson.map(geojson => {
                    if (geojson === undefined) {
                        return undefined;
                    }
                    return new SubtleButton(Svg.download_svg(), "Download the loaded geojson from overpass").onClick(() => {
                        Utils.offerContentsAsDownloadableFile(JSON.stringify(geojson, null, "  "), "mapcomplete-" + layer.id + ".geojson", {
                            mimetype: "application/json+geo"
                        })
                    });
                })),
            new VariableUiElement(cacheAge.map(age => {
                if (age === undefined) {
                    return undefined;
                }
                if (age < 0) {
                    return new FixedUiElement("Cache was expired")
                }
                return new FixedUiElement("Loaded data is from the cache and is " + Utils.toHumanTime(age) + " old")
            })),

            new Title("Live data on OSM"),
            osmLiveData,
            new Combine(["The live data is shown if the zoomlevel is at least ", zoomLevel, ". The current zoom level is ", new VariableUiElement(osmLiveData.location.map(l => "" + l.zoom))]).SetClass("flex"),

            new Title("Nearby features"),
            new Combine(["The following map shows features to import which have an OSM-feature within ", nearbyCutoff, "meter"]).SetClass("flex"),
            new FixedUiElement("The red elements on the following map will <b>not</b> be imported!").SetClass("alert"),
            "Set the range to 0 or 1 if you want to import them all",
            matchedFeaturesMap]).SetClass("flex flex-col")

        super([
            new Title("Comparison with existing data"),
            new VariableUiElement(overpassStatus.map(d => {
                if (d === "idle") {
                    return new Loading("Checking local storage...")
                }
                if (d["error"] !== undefined) {
                    return new FixedUiElement("Could not load latest data from overpass: " + d["error"]).SetClass("alert")
                }
                if (d === "running") {
                    return new Loading("Querying overpass...")
                }
                if (d === "cached") {
                    return conflationMaps
                }
                if (d === "success") {
                    return conflationMaps
                }
                return new FixedUiElement("Unexpected state " + d).SetClass("alert")
            }))

        ])

        this.Value = paritionedImport.map(feats => ({features: feats?.noNearby, layer: params.layer}))
        this.Value.addCallbackAndRun(v => console.log("ConflationChecker-step value is ", v))
        this.IsValid = this.Value.map(v => v?.features !== undefined && v.features.length > 0)
    }

}