import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";

/**
 * Merges features from different featureSources
 * Uses the freshest feature available in the case multiple sources offer data with the same identifier
 */
export default class FeatureSourceMerger implements FeatureSource {

    public features: UIEventSource<{ feature: any; freshness: Date }[]> = new UIEventSource<{ feature: any; freshness: Date }[]>([]);
    public readonly name;
    private readonly _sources: FeatureSource[];

    constructor(sources: FeatureSource[]) {
        this._sources = sources;
        this.name = "SourceMerger of (" + sources.map(s => s.name).join(", ") + ")"
        const self = this;
        for (let i = 0; i < sources.length; i++) {
            let source = sources[i];
            source.features.addCallback(() => {
                self.Update();
            });
        }
        this.Update();
    }

    private Update() {

        let somethingChanged = false;
        const all: Map<string, { feature: any, freshness: Date }> = new Map<string, { feature: any; freshness: Date }>();
        // We seed the dictionary with the previously loaded features
        const oldValues = this.features.data ?? [];
        for (const oldValue of oldValues) {
            all.set(oldValue.feature.id + oldValue.feature._matching_layer_id, oldValue)
        }

        for (const source of this._sources) {
            if (source?.features?.data === undefined) {
                continue;
            }
            for (const f of source.features.data) {
                const id = f.feature.properties.id + f.feature._matching_layer_id;
                if (!all.has(id)) {
                    // This is a new feature
                    somethingChanged = true;
                    all.set(id, f);
                    continue;
                }

                // This value has been seen already, either in a previous run or by a previous datasource
                // Let's figure out if something changed
                const oldV = all.get(id);
                if (oldV.freshness < f.freshness) {
                    // Jup, this feature is fresher
                    all.set(id, f);
                    somethingChanged = true;
                }
            }
        }
        
        if(!somethingChanged){
            // We don't bother triggering an update
            return;
        }
        
        const newList = [];
        all.forEach((value, key) => {
            newList.push(value)
        })
        this.features.setData(newList);
    }


}