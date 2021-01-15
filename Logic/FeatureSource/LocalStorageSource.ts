import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import LocalStorageSaver from "./LocalStorageSaver";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";

export default class LocalStorageSource implements FeatureSource {
    public features: UIEventSource<{ feature: any; freshness: Date }[]>;

    constructor(layout: UIEventSource<LayoutConfig>) {
        this.features = new UIEventSource<{ feature: any; freshness: Date }[]>([])
        const key = LocalStorageSaver.storageKey + layout.data.id
        try {
            const fromStorage = localStorage.getItem(key);
            if (fromStorage == null) {
                return;
            }
            const loaded = JSON.parse(fromStorage);
            this.features.setData(loaded);
            console.log("Loaded ",loaded.length," features from localstorage as cache")
        } catch (e) {
            console.log("Could not load features from localStorage:", e)
            localStorage.removeItem(key)
        }

    }
}