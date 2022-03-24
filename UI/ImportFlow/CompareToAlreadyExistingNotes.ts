import Combine from "../Base/Combine";
import {FlowStep} from "./FlowStep";
import {BBox} from "../../Logic/BBox";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import {UIEventSource} from "../../Logic/UIEventSource";
import CreateNoteImportLayer from "../../Models/ThemeConfig/Conversion/CreateNoteImportLayer";
import FilteredLayer, {FilterState} from "../../Models/FilteredLayer";
import GeoJsonSource from "../../Logic/FeatureSource/Sources/GeoJsonSource";
import MetaTagging from "../../Logic/MetaTagging";
import RelationsTracker from "../../Logic/Osm/RelationsTracker";
import FilteringFeatureSource from "../../Logic/FeatureSource/Sources/FilteringFeatureSource";
import Minimap from "../Base/Minimap";
import ShowDataLayer from "../ShowDataLayer/ShowDataLayer";
import FeatureInfoBox from "../Popup/FeatureInfoBox";
import {ImportUtils} from "./ImportUtils";
import * as import_candidate from "../../assets/layers/import_candidate/import_candidate.json";
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource";
import Title from "../Base/Title";
import Loading from "../Base/Loading";
import {FixedUiElement} from "../Base/FixedUiElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import * as known_layers from "../../assets/generated/known_layers.json"
import {LayerConfigJson} from "../../Models/ThemeConfig/Json/LayerConfigJson";

/**
 * Filters out points for which the import-note already exists, to prevent duplicates
 */
export class CompareToAlreadyExistingNotes extends Combine implements FlowStep<{ bbox: BBox, layer: LayerConfig, features: any[], theme: string }> {

    public IsValid: UIEventSource<boolean>
    public Value: UIEventSource<{ bbox: BBox, layer: LayerConfig, features: any[] , theme: string}>


    constructor(state, params: { bbox: BBox, layer: LayerConfig,  features: any[], theme: string }) {

        const layerConfig = known_layers.layers.filter(l => l.id === params.layer.id)[0]
        if (layerConfig === undefined) {
            console.error("WEIRD: layer not found in the builtin layer overview")
        }
        const importLayerJson = new CreateNoteImportLayer(150).convertStrict(<LayerConfigJson>layerConfig, "CompareToAlreadyExistingNotes")
        const importLayer = new LayerConfig(importLayerJson, "import-layer-dynamic")
        const flayer: FilteredLayer = {
            appliedFilters: new UIEventSource<Map<string, FilterState>>(new Map<string, FilterState>()),
            isDisplayed: new UIEventSource<boolean>(true),
            layerDef: importLayer
        }
        const allNotesWithinBbox = new GeoJsonSource(flayer, params.bbox.padAbsolute(0.0001))
        
        allNotesWithinBbox.features.map(f => MetaTagging.addMetatags(
                f,
                {
                    memberships: new RelationsTracker(),
                    getFeaturesWithin: () => [],
                    getFeatureById: () => undefined
                },
                importLayer,
                state,
                {
                    includeDates: true,
                    // We assume that the non-dated metatags are already set by the cache generator
                    includeNonDates: true
                }
            )
        )
        const alreadyOpenImportNotes = new FilteringFeatureSource(state, undefined, allNotesWithinBbox)
        alreadyOpenImportNotes.features.addCallbackD(features => console.log("Loaded and filtered features are", features))
        const map = Minimap.createMiniMap()
        map.SetClass("w-full").SetStyle("height: 500px")

        const comparisonMap = Minimap.createMiniMap({
            location: map.location,

        })
        comparisonMap.SetClass("w-full").SetStyle("height: 500px")

        new ShowDataLayer({
            layerToShow: importLayer,
            state,
            zoomToFeatures: true,
            leafletMap: map.leafletMap,
            features: alreadyOpenImportNotes,
            popup: (tags, layer) => new FeatureInfoBox(tags, layer, state)
        })


        const maxDistance = new UIEventSource<number>(10)

        const partitionedImportPoints = ImportUtils.partitionFeaturesIfNearby(params, alreadyOpenImportNotes.features
            .map(ff => ({features: ff.map(ff => ff.feature)})), maxDistance)


        new ShowDataLayer({
            layerToShow: new LayerConfig(import_candidate),
            state,
            zoomToFeatures: true,
            leafletMap: comparisonMap.leafletMap,
            features: new StaticFeatureSource(partitionedImportPoints.map(p => p.hasNearby), false),
            popup: (tags, layer) => new FeatureInfoBox(tags, layer, state)
        })

        super([
            new Title("Compare with already existing 'to-import'-notes"),
            new VariableUiElement(
                alreadyOpenImportNotes.features.map(notesWithImport => {
                    if(allNotesWithinBbox.state.data !== undefined  && allNotesWithinBbox.state.data["error"] !== undefined){
                        return new FixedUiElement("Loading notes failed: "+allNotesWithinBbox.state.data["error"]   )
                    }
                    if (allNotesWithinBbox.features.data === undefined || allNotesWithinBbox.features.data.length === 0) {
                        return new Loading("Fetching notes from OSM")
                    }
                    if (notesWithImport.length === 0) {
                        return new FixedUiElement("No previous import notes found").SetClass("thanks")
                    }
                    return new Combine([
                        "The red elements on the next map are all the data points from your dataset. There are <b>"+params.features.length+"</b> elements in your dataset.",
                        map,
                        
                      new VariableUiElement(  partitionedImportPoints.map(({noNearby, hasNearby}) => {
                            
                          if(noNearby.length === 0){
                              // Nothing can be imported
                            return  new FixedUiElement("All of the proposed points have (or had) an import note already").SetClass("alert w-full block").SetStyle("padding: 0.5rem")
                          }
                          
                          if(hasNearby.length === 0){
                              // All points can be imported
                             return new FixedUiElement("All of the proposed points have don't have a previous import note nearby").SetClass("thanks w-full block").SetStyle("padding: 0.5rem")

                          }
                          
                          return new Combine([
                              new FixedUiElement(hasNearby.length+" points do have an already existing import note within "+maxDistance.data+" meter.").SetClass("alert"),
                              "These data points will <i>not</i> be imported and are shown as red dots on the map below",
                              comparisonMap.SetClass("w-full")
                          ]).SetClass("w-full")
                        }))
                        
                        
                    ]).SetClass("flex flex-col")

                }, [allNotesWithinBbox.features, allNotesWithinBbox.state])
            ),


        ]);
        this.SetClass("flex flex-col")
        this.Value = partitionedImportPoints.map(({noNearby}) => ({
            features: noNearby,
            bbox: params.bbox,
            layer: params.layer,
            theme: params.theme
        }))

        this.IsValid = alreadyOpenImportNotes.features.map(ff => {
            if (allNotesWithinBbox.features.data.length === 0) {
                // Not yet loaded
                return false
            }
            if (ff.length == 0) {
                // No import notes at all
                return true;
            }

            return partitionedImportPoints.data.noNearby.length > 0; // at least _something_ can be imported
        }, [partitionedImportPoints, allNotesWithinBbox.features])
    }

}