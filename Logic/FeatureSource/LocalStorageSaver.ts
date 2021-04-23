/***
 * Saves all the features that are passed in to localstorage, so they can be retrieved on the next run
 *
 * Technically, more an Actor then a featuresource, but it fits more neatly this ay
 */
import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";

export default class LocalStorageSaver implements FeatureSource {
    public static readonly storageKey: string = "cached-features";
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]>;

    public readonly name = "LocalStorageSaver";
    
    constructor(source: FeatureSource, layout: UIEventSource<LayoutConfig>) {
        this.features = source.features;

        this.features.addCallbackAndRun(features => {
            if (features === undefined) {
                return;
            }
            
            const now = new Date().getTime()
            features = features.filter(f => layout.data.cacheTimeout > Math.abs(now - f.freshness.getTime())/1000) 
            
       
            if(features.length == 0){
                return;
            }

            try {
                const key = LocalStorageSaver.storageKey+layout.data.id
                localStorage.setItem(key, JSON.stringify(features));
                console.log("Saved ",features.length, "elements to",key)
            } catch (e) {
                console.warn("Could not save the features to local storage:", e)
            }
        })


    }


}