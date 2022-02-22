import FeatureSource from "../FeatureSource";
import {UIEventSource} from "../../UIEventSource";

/**
 * A simple dummy implementation for whenever it is needed
 */
export default class StaticFeatureSource implements FeatureSource {
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]>;
    public readonly name: string = "StaticFeatureSource"

    constructor(features: any[] | UIEventSource<any[] | UIEventSource<{ feature: any, freshness: Date }>>, useFeaturesDirectly) {
        const now = new Date();
        if(features === undefined){
            throw "Static feature source received undefined as source"
        }
        if (useFeaturesDirectly) {
            // @ts-ignore
            this.features = features
        } else if (features instanceof UIEventSource) {
            // @ts-ignore
            this.features = features.map(features => features?.map(f => ({feature: f, freshness: now}) ?? []))
        } else {
            this.features = new UIEventSource(features?.map(f => ({
                feature: f,
                freshness: now
            }))??[])
        }
    }


}