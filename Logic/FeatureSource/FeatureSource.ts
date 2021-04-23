import {UIEventSource} from "../UIEventSource";

export default interface FeatureSource {
    features: UIEventSource<{feature: any, freshness: Date}[]>;
    /**
     * Mainly used for debuging
     */
    name: string;
}