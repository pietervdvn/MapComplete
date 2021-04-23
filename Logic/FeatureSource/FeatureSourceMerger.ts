import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";

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
        let all = {}; // Mapping 'id' -> {feature, freshness}
        for (const source of this._sources) {
            if (source?.features?.data === undefined) {
                continue;
            }
            for (const f of source.features.data) {
                const id = f.feature.properties.id;
                const oldV = all[id];
                if (oldV === undefined) {
                    all[id] = f;
                } else {
                    if (oldV.freshness < f.freshness) {
                        all[id] = f;
                    }
                }
            }
        }
        const newList = [];
        for (const id in all) {
            newList.push(all[id]);
        }
        this.features.setData(newList);
    }


}