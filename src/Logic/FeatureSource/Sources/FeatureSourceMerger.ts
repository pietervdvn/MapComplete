import { Store, UIEventSource } from "../../UIEventSource"
import { FeatureSource, IndexedFeatureSource, UpdatableFeatureSource } from "../FeatureSource"
import { Feature } from "geojson"
import { Utils } from "../../../Utils"

/**
 * The featureSourceMerger receives complete geometries from various sources.
 * If multiple sources contain the same object (as determined by 'id'), only one copy of them is retained
 */
export default class FeatureSourceMerger<Src extends FeatureSource = FeatureSource>
    implements IndexedFeatureSource
{
    public features: UIEventSource<Feature[]> = new UIEventSource([])
    public readonly featuresById: Store<Map<string, Feature>>
    protected readonly _featuresById: UIEventSource<Map<string, Feature>>
    protected readonly _sources: Src[]

    /**
     * Merges features from different featureSources.
     * In case that multiple features have the same id, the latest `_version_number` will be used. Otherwise, we will take the last one
     */
    constructor(...sources: Src[]) {
        this._featuresById = new UIEventSource<Map<string, Feature>>(new Map<string, Feature>())
        this.featuresById = this._featuresById
        const self = this
        sources = Utils.NoNull(sources)
        for (let source of sources) {
            source.features.addCallback(() => {
                self.addDataFromSources(sources)
            })
        }
        this._sources = sources
        this.addDataFromSources(sources)
    }

    public addSource(source: Src) {
        if (!source) {
            return
        }
        if (!source.features) {
            console.error("No source found in", source)
        }
        this._sources.push(source)
        source.features.addCallbackAndRun(() => {
            this.addDataFromSources(this._sources)
        })
    }

    protected addDataFromSources(sources: Src[]) {
        this.addData(sources.map((s) => s.features.data))
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
                    // This is a new, previously unseen feature
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

        const newList = Array.from(all.values())

        this.features.setData(newList)
        this._featuresById.setData(all)
    }
}

export class UpdatableFeatureSourceMerger<
        Src extends UpdatableFeatureSource = UpdatableFeatureSource
    >
    extends FeatureSourceMerger<Src>
    implements IndexedFeatureSource, UpdatableFeatureSource
{
    constructor(...sources: Src[]) {
        super(...sources)
    }
    async updateAsync() {
        await Promise.all(this._sources.map((src) => src.updateAsync()))
    }
}
