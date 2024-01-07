import { Store, UIEventSource } from "../../UIEventSource"
import { FeatureSource, IndexedFeatureSource } from "../FeatureSource"
import { Feature } from "geojson"
import { Utils } from "../../../Utils"

/**
 *
 */
export default class FeatureSourceMerger implements IndexedFeatureSource {
    public features: UIEventSource<Feature[]> = new UIEventSource([])
    public readonly featuresById: Store<Map<string, Feature>>
    private readonly _featuresById: UIEventSource<Map<string, Feature>>
    private readonly _sources: FeatureSource[] = []
    /**
     * Merges features from different featureSources.
     * In case that multiple features have the same id, the latest `_version_number` will be used. Otherwise, we will take the last one
     */
    constructor(...sources: FeatureSource[]) {
        this._featuresById = new UIEventSource<Map<string, Feature>>(new Map<string, Feature>())
        this.featuresById = this._featuresById
        const self = this
        sources = Utils.NoNull(sources)
        for (let source of sources) {
            source.features.addCallback(() => {
                self.addData(sources.map((s) => s.features.data))
            })
        }
        this.addData(sources.map((s) => s.features.data))
        this._sources = sources
    }

    public addSource(source: FeatureSource) {
        if (!source) {
            return
        }
        this._sources.push(source)
        source.features.addCallbackAndRun(() => {
            this.addData(this._sources.map((s) => s.features.data))
        })
    }

    protected addData(sources: Feature[][]) {
        sources = Utils.NoNull(sources)
        let somethingChanged = false
        const all: Map<string, Feature> = new Map()
        const unseen = new Set<string>()
        // We seed the dictionary with the previously loaded features
        const oldValues = this.features.data ?? []
        for (const oldValue of oldValues) {
            all.set(oldValue.properties.id, oldValue)
            unseen.add(oldValue.properties.id)
        }

        for (const features of sources) {
            for (const f of features) {
                const id = f.properties.id
                unseen.delete(id)
                if (!all.has(id)) {
                    // This is a new feature
                    somethingChanged = true
                    all.set(id, f)
                    continue
                }

                // This value has been seen already, either in a previous run or by a previous datasource
                // Let's figure out if something changed
                const oldV = all.get(id)
                if (oldV == f) {
                    continue
                }
                all.set(id, f)
                somethingChanged = true
            }
        }

        somethingChanged ||= unseen.size > 0
        unseen.forEach((id) => all.delete(id))

        if (!somethingChanged) {
            // We don't bother triggering an update
            return
        }

        const newList = []
        all.forEach((value) => {
            newList.push(value)
        })
        this.features.setData(newList)
        this._featuresById.setData(all)
    }
}
