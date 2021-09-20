import FeatureSource from "../FeatureSource";
import {UIEventSource} from "../../UIEventSource";

/**
 * A simple dummy implementation for whenever it is needed
 */
export default class StaticFeatureSource implements FeatureSource {
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]>;
    public readonly name: string = "StaticFeatureSource"

    constructor(features: any[]) {
        const now = new Date();
        this.features = new UIEventSource(features.map(f => ({
            feature: f,
            freshness: now
        })))
    }


}