import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import LayerConfig from "../../Customizations/JSON/LayerConfig";


/**
 * In some rare cases, some elements are shown on multiple layers (when 'passthrough' is enabled)
 * If this is the case, multiple objects with a different _matching_layer_id are generated.
 * In any case, this featureSource marks the objects with _matching_layer_id
 */
export default class FeatureDuplicatorPerLayer implements FeatureSource {
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]>;

    public readonly name;

    constructor(layers: UIEventSource<{ layerDef: LayerConfig }[]>, upstream: FeatureSource) {
        this.name = "FeatureDuplicator of "+upstream.name;
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
                    continue;
                }

                
                let foundALayer = false;
                for (const layer of layers.data) {
                    if (layer.layerDef.source.osmTags.matchesProperties(f.feature.properties)) {
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
            }
            return newFeatures;

        })

    }

}