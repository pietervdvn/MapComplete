import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import LocalStorageSaver from "./LocalStorageSaver";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";

export default class LocalStorageSource implements FeatureSource {
    public features: UIEventSource<{ feature: any; freshness: Date }[]>;
    public readonly name = "LocalStorageSource";

    constructor(layout: UIEventSource<LayoutConfig>) {
        this.features = new UIEventSource<{ feature: any; freshness: Date }[]>([])
        const key = LocalStorageSaver.storageKey + layout.data.id
        layout.addCallbackAndRun(_ => {


            try {
                const fromStorage = localStorage.getItem(key);
                if (fromStorage == null) {
                    return;
                }
                const loaded :  { feature: any; freshness: Date | string }[]= 
                    JSON.parse(fromStorage);
                
                const parsed :  { feature: any; freshness: Date }[]= loaded.map(ff => ({
                    feature: ff.feature,
                    freshness : typeof ff.freshness == "string" ? new Date(ff.freshness) : ff.freshness
                }))
                
                this.features.setData(parsed);
                console.log("Loaded ", loaded.length, " features from localstorage as cache")
            } catch (e) {
                console.log("Could not load features from localStorage:", e)
                localStorage.removeItem(key)
            }
        })
    }
}