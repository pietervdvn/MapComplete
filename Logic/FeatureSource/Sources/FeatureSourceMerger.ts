import { UIEventSource } from "../../UIEventSource"
import FeatureSource, { FeatureSourceForLayer, IndexedFeatureSource, Tiled } from "../FeatureSource"
import FilteredLayer from "../../../Models/FilteredLayer"
import { BBox } from "../../BBox"
import { Feature } from "geojson"

export default class FeatureSourceMerger
    implements FeatureSourceForLayer, Tiled, IndexedFeatureSource
{
    public features: UIEventSource<Feature[]> = new UIEventSource([])
    public readonly layer: FilteredLayer
    public readonly tileIndex: number
    public readonly bbox: BBox
    public readonly containedIds: UIEventSource<Set<string>> = new UIEventSource<Set<string>>(
        new Set()
    )
    private readonly _sources: UIEventSource<FeatureSource[]>
    /**
     * Merges features from different featureSources for a single layer
     * Uses the freshest feature available in the case multiple sources offer data with the same identifier
     */
    constructor(
        layer: FilteredLayer,
        tileIndex: number,
        bbox: BBox,
        sources: UIEventSource<FeatureSource[]>
    ) {
        this.tileIndex = tileIndex
        this.bbox = bbox
        this._sources = sources
        this.layer = layer
        const self = this

        const handledSources = new Set<FeatureSource>()

        sources.addCallbackAndRunD((sources) => {
            let newSourceRegistered = false
            for (let i = 0; i < sources.length; i++) {
                let source = sources[i]
                if (handledSources.has(source)) {
                    continue
                }
                handledSources.add(source)
                newSourceRegistered = true
                source.features.addCallback(() => {
                    self.Update()
                })
                if (newSourceRegistered) {
                    self.Update()
                }
            }
        })
    }

    private Update() {
        let somethingChanged = false
        const all: Map<string, Feature> = new Map()
        // We seed the dictionary with the previously loaded features
        const oldValues = this.features.data ?? []
        for (const oldValue of oldValues) {
            all.set(oldValue.properties.id, oldValue)
        }

        for (const source of this._sources.data) {
            if (source?.features?.data === undefined) {
                continue
            }
            for (const f of source.features.data) {
                const id = f.properties.id
                if (!all.has(id)) {
                    // This is a new feature
                    somethingChanged = true
                    all.set(id, f)
                    continue
                }

                // This value has been seen already, either in a previous run or by a previous datasource
                // Let's figure out if something changed
                const oldV = all.get(id)
                if (oldV === f) {
                    continue
                }
                all.set(id, f)
                somethingChanged = true
            }
        }

        if (!somethingChanged) {
            // We don't bother triggering an update
            return
        }

        const newList = []
        all.forEach((value, _) => {
            newList.push(value)
        })
        this.containedIds.setData(new Set(all.keys()))
        this.features.setData(newList)
    }
}
