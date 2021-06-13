/**
 * Every previously added point is remembered, but new points are added
 */
import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";

export default class RememberingSource implements FeatureSource {
    public readonly features: UIEventSource<{ feature: any, freshness: Date }[]>;

    public readonly name;
    
    constructor(source: FeatureSource) {
        const self = this;
        this.name = "RememberingSource of "+source.name;
        const empty = [];
        this.features = source.features.map(features => {
            const oldFeatures = self.features?.data ?? empty;
            if (features === undefined) {
                return oldFeatures;
            }
           
            // Then new ids
            const ids = new Set<string>(features.map(f => f.feature.properties.id + f.feature.geometry.type + f.feature._matching_layer_id));
            // the old data
            const oldData = oldFeatures.filter(old => !ids.has(old.feature.properties.id + old.feature.geometry.type + old.feature._matching_layer_id))
            return [...features, ...oldData];
        })
    }

}