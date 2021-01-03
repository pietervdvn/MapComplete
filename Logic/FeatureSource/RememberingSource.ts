/**
 * Every previously added point is remembered, but new points are added
 */
import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";

export default class RememberingSource implements FeatureSource{
    features: UIEventSource<{feature: any, freshness: Date}[]> = new UIEventSource<{feature: any, freshness: Date}[]>([]);
    
    constructor(source: FeatureSource) {
        const self = this;
        source.features.addCallbackAndRun(features => {
            if(features === undefined){
                return;
            }
            const ids = new Set<string>( features.map(f => f.feature.properties.id+f.feature.geometry.type));
            const newList = features.concat(
                self.features.data.filter(old => !ids.has(old.feature.properties.id+old.feature.geometry.type))
            )
            self.features.setData(newList);
        })
    }
    
}