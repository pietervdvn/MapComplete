/**
 * Every previously added point is remembered, but new points are added
 */
import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";

export default class RememberingSource implements FeatureSource {
    features: UIEventSource<{ feature: any, freshness: Date }[]>;

    constructor(source: FeatureSource) {
        const self = this;
        const empty = [];
        this.features = source.features.map(features => {
            const oldFeatures = self.features?.data ?? empty;
            if (features === undefined) {
                return oldFeatures;
            }
           
            // Then new ids
            const ids = new Set<string>(features.map(f => f.feature.properties.id + f.feature.geometry.type));
            // the old data
            const oldData = oldFeatures.filter(old => !ids.has(old.feature.properties.id + old.feature.geometry.type))
            return [...features, ...oldData];
        })
    }

}