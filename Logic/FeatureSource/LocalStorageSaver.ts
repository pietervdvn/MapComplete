/***
 * Saves all the features that are passed in to localstorage, so they can be retrieved on the next run
 *
 * Technically, more an Actor then a featuresource, but it fits more neatly this ay
 */
import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";

export default class LocalStorageSaver implements FeatureSource {
    public static readonly storageKey: string = "cached-features";
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]>;

    constructor(source: FeatureSource) {
        this.features = source.features;

        this.features.addCallbackAndRun(features => {
            if (features === undefined) {
                return;
            }
            if(features.length == 0){
                return;
            }

            try {
                localStorage.setItem(LocalStorageSaver.storageKey, JSON.stringify(features));
            } catch (e) {
                console.warn("Could not save the features to local storage:", e)
            }
        })


    }


}