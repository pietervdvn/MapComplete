import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import {GeoOperations} from "../GeoOperations";

export default class WayHandlingApplyingFeatureSource implements FeatureSource {
    features: UIEventSource<{ feature: any; freshness: Date }[]>;

    constructor(layers: {
                    layerDef: LayerConfig
                }[],
                upstream: FeatureSource) {
        const layerDict = {};
        let allDefaultWayHandling = true;
        for (const layer of layers) {
            layerDict[layer.layerDef.id] = layer;
            if (layer.layerDef.wayHandling !== LayerConfig.WAYHANDLING_DEFAULT) {
                allDefaultWayHandling = false;
            }
        }
        if (allDefaultWayHandling) {
            this.features = upstream.features;
            return;
        }


        this.features = upstream.features.map(
            features => {
                if(features === undefined){
                    return;
                }
                const newFeatures: { feature: any, freshness: Date }[] = [];
                for (const f of features) {
                    const feat = f.feature;
                    const layerId = feat._matching_layer_id;
                    const layer: LayerConfig = layerDict[layerId].layerDef;
                    if (layer === undefined) {
                        throw "No layer found with id " + layerId;
                    }
                    
                    if(layer.wayHandling === LayerConfig.WAYHANDLING_DEFAULT){
                        newFeatures.push(f);
                        continue;
                    }

                    if (feat.geometry.type === "Point") {
                        newFeatures.push(f);
                        // it is a point, nothing to do here
                        continue;
                    }

                    const centerPoint = GeoOperations.centerpoint(feat);
                    centerPoint._matching_layer_id = feat._matching_layer_id;
                    newFeatures.push({feature: centerPoint, freshness: f.freshness});
                    
                    if(layer.wayHandling === LayerConfig.WAYHANDLING_CENTER_AND_WAY){
                        newFeatures.push(f);
                    }
                    
                }
                return newFeatures;
            }
        );

    }

}