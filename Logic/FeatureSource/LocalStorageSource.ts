import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import LocalStorageSaver from "./LocalStorageSaver";

export default class LocalStorageSource implements FeatureSource {
    public features: UIEventSource<{ feature: any; freshness: Date }[]>;

    constructor() {
        this.features = new UIEventSource<{ feature: any; freshness: Date }[]>([])
        try {
            const fromStorage = localStorage.getItem(LocalStorageSaver.storageKey);
            if (fromStorage == null) {
                return;
            }
            const loaded = JSON.parse(fromStorage);
            this.features.setData(loaded);
        } catch (e) {
            console.log("Could not load features from localStorage:", e)
        }

    }
}