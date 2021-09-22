/**
 * Merges features from different featureSources for a single layer
 * Uses the freshest feature available in the case multiple sources offer data with the same identifier
 */
import {UIEventSource} from "../../UIEventSource";
import FeatureSource, {FeatureSourceForLayer, IndexedFeatureSource, Tiled} from "../FeatureSource";
import FilteredLayer from "../../../Models/FilteredLayer";
import {BBox} from "../../GeoOperations";
import {Utils} from "../../../Utils";

export default class FeatureSourceMerger implements FeatureSourceForLayer, Tiled, IndexedFeatureSource {

    public features: UIEventSource<{ feature: any; freshness: Date }[]> = new UIEventSource<{ feature: any; freshness: Date }[]>([]);
    public readonly name;
    public readonly layer: FilteredLayer
    private readonly _sources: UIEventSource<FeatureSource[]>;
    public readonly tileIndex: number;
    public readonly bbox: BBox;
    public readonly containedIds: UIEventSource<Set<string>> = new UIEventSource<Set<string>>(new Set())

    constructor(layer: FilteredLayer, tileIndex: number, bbox: BBox, sources: UIEventSource<FeatureSource[]>) {
        this.tileIndex = tileIndex;
        this.bbox = bbox;
        this._sources = sources;
        this.layer = layer;
        this.name = "FeatureSourceMerger("+layer.layerDef.id+", "+Utils.tile_from_index(tileIndex).join(",")+")"
        const self = this;

        const handledSources = new Set<FeatureSource>();

        sources.addCallbackAndRunD(sources => {
            let newSourceRegistered = false;
            for (let i = 0; i < sources.length; i++) {
                let source = sources[i];
                if (handledSources.has(source)) {
                    continue
                }
                handledSources.add(source)
                newSourceRegistered = true
                source.features.addCallback(() => {
                    self.Update();
                });
                if (newSourceRegistered) {
                    self.Update();
                }
            }
        })

    }

    private Update() {

        let somethingChanged = false;
        const all: Map<string, { feature: any, freshness: Date }> = new Map<string, { feature: any; freshness: Date }>();
        // We seed the dictionary with the previously loaded features
        const oldValues = this.features.data ?? [];
        for (const oldValue of oldValues) {
            all.set(oldValue.feature.id, oldValue)
        }

        for (const source of this._sources.data) {
            if (source?.features?.data === undefined) {
                continue;
            }
            for (const f of source.features.data) {
                const id = f.feature.properties.id;
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

        if (!somethingChanged) {
            // We don't bother triggering an update
            return;
        }

        const newList = [];
        all.forEach((value, _) => {
            newList.push(value)
        })
        this.containedIds.setData(new Set(all.keys()))
        this.features.setData(newList);
    }


}