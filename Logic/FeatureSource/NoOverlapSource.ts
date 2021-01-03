import LayerConfig from "../../Customizations/JSON/LayerConfig";
import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import {GeoOperations} from "../GeoOperations";

/**
 * The no overlap source takes a featureSource and applies a filter on it.
 * First, it'll figure out for each feature to which layer it belongs
 * Then, it'll check any feature of any 'lower' layer
 */
export default class NoOverlapSource {

    features: UIEventSource<{ feature: any, freshness: Date }[]> = new UIEventSource<{ feature: any, freshness: Date }[]>([]);

    constructor(layers: {
                    layerDef: LayerConfig
                }[],
                upstream: FeatureSource) {
        const layerDict = {};
        let noOverlapRemoval = true;
        const layerIds = []
        for (const layer of layers) {
            layerDict[layer.layerDef.id] = layer;
            layerIds.push(layer.layerDef.id);
            if ((layer.layerDef.hideUnderlayingFeaturesMinPercentage ?? 0) !== 0) {
                noOverlapRemoval = false;
            }
        }
        if (noOverlapRemoval) {
            this.features = upstream.features;
            return;
        }


        this.features = upstream.features.map(
            features => {
                if (features === undefined) {
                    return;
                }
               
                // There is overlap removal active
                // We partition all the features with their respective layerIDs
                const partitions = {};
                for (const layerId of layerIds) {
                    partitions[layerId] = []
                }
                for (const feature of features) {
                    partitions[feature.feature.properties._matching_layer_id].push(feature);
                }

                // With this partitioning in hand, we run over every layer and remove every underlying feature if needed
                for (let i = 0; i < layerIds.length; i++) {
                    let layerId = layerIds[i];
                    const percentage = layerDict[layerId].layerDef.hideUnderlayingFeaturesMinPercentage ?? 0;
                    if (percentage === 0) {
                        // We don't have to remove underlying features!
                        continue;
                    }
                    const guardPartition = partitions[layerId];
                    for (let j = i + 1; j < layerIds.length; j++) {
                        let layerJd = layerIds[j];
                        let partitionToShrink: { feature: any, freshness: Date }[] = partitions[layerJd];
                        let newPartition = [];
                        for (const mightBeDeleted of partitionToShrink) {
                            const doesOverlap = GeoOperations.featureIsContainedInAny(
                                mightBeDeleted.feature,
                                guardPartition.map(f => f.feature),
                                percentage
                            );
                            if(!doesOverlap){
                                newPartition.push(mightBeDeleted);
                            }
                        }
                        partitions[layerJd] = newPartition;
                    }
                }

                // At last, we create the actual new features
                let newFeatures: { feature: any, freshness: Date }[] = [];
                for (const layerId of layerIds) {
                    newFeatures = newFeatures.concat(partitions[layerId]);
                }
                return newFeatures;
            });
    }
}