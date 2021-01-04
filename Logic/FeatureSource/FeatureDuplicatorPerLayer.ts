import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import LayerConfig from "../../Customizations/JSON/LayerConfig";


/**
 * In some rare cases, some elements are shown on multiple layers (when 'passthrough' is enabled)
 * If this is the case, multiple objects with a different _matching_layer_id are generated.
 * If not, the _feature_layter_id is added
 */
export default class FeatureDuplicatorPerLayer implements FeatureSource {
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]>;


    constructor(layers: { layerDef: LayerConfig }[], upstream: FeatureSource) {
        let noPassthroughts = true;
        for (const layer of layers) {
            if (layer.layerDef.passAllFeatures) {
                noPassthroughts = false;
                break;
            }
        }

        this.features = upstream.features.map(features => {
            const newFeatures: { feature: any, freshness: Date }[] = [];
            if(features === undefined){
                return newFeatures;
            }

           
            for (const f of features) {
                if (f.feature._matching_layer_id) {
                    // Already matched previously
                    // We simply add it
                    newFeatures.push(f);
                    return;
                }

                
                let foundALayer = false;
                for (const layer of layers) {
                    if (layer.layerDef.overpassTags.matchesProperties(f.feature.properties)) {
                        foundALayer = true;
                        if (layer.layerDef.passAllFeatures) {

                            // We copy the feature; the "properties" field is kept identical though!
                            // Keeping "properties" identical is needed, as it might break the 'allElementStorage' otherwise
                            const newFeature = {
                                geometry: f.feature.geometry,
                                id: f.feature.id,
                                type: f.feature.type,
                                properties: f.feature.properties,
                                _matching_layer_id : layer.layerDef.id
                            }
                            newFeatures.push({feature: newFeature, freshness: f.freshness});
                        } else {
                            // If not 'passAllFeatures', we are done
                            f.feature._matching_layer_id = layer.layerDef.id;
                            newFeatures.push(f);
                            break;
                        }
                    }
                }
                if(!foundALayer){
                    console.error("LAYER DEDUP PANIC: no suitable layer found for ", f, JSON.stringify(f), "within layers", layers)
                }
            }
            return newFeatures;

        })

    }

}