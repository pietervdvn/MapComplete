/**
 * Every previously added point is remembered, but new points are added.
 * Data coming from upstream will always overwrite a previous value
 */
import FeatureSource, { Tiled } from "../FeatureSource"
import { Store, UIEventSource } from "../../UIEventSource"
import { BBox } from "../../BBox"
import { Feature } from "geojson"

export default class RememberingSource implements FeatureSource, Tiled {
    public readonly features: Store<Feature[]>
    public readonly tileIndex: number
    public readonly bbox: BBox

    constructor(source: FeatureSource & Tiled) {
        const self = this
        this.tileIndex = source.tileIndex
        this.bbox = source.bbox

        const empty = []
        const featureSource = new UIEventSource<Feature[]>(empty)
        this.features = featureSource
        source.features.addCallbackAndRunD((features) => {
            const oldFeatures = self.features?.data ?? empty
            // Then new ids
            const ids = new Set<string>(features.map((f) => f.properties.id + f.geometry.type))
            // the old data
            const oldData = oldFeatures.filter(
                (old) => !ids.has(old.feature.properties.id + old.feature.geometry.type)
            )
            featureSource.setData([...features, ...oldData])
        })
    }
}
