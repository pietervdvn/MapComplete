import { FeatureSource, FeatureSourceForLayer } from "../FeatureSource"
import StaticFeatureSource from "./StaticFeatureSource"
import { BBox } from "../../BBox"
import FilteredLayer from "../../../Models/FilteredLayer"
import { Store } from "../../UIEventSource"

/**
 * Results in a feature source which has all the elements that touch the given features
 */
export default class BBoxFeatureSource extends StaticFeatureSource {
    constructor(features: FeatureSource, mustTouch: Store<BBox>) {
        super(
            features.features.mapD(
                (features) => {
                    if (mustTouch.data === undefined) {
                        return features
                    }
                    const box = mustTouch.data
                    return features.filter((feature) => {
                        if (feature.geometry.type === "Point") {
                            return box.contains(<[number, number]>feature.geometry.coordinates)
                        }
                        return box.overlapsWith(BBox.get(feature))
                    })
                },
                [mustTouch]
            )
        )
    }
}

export class BBoxFeatureSourceForLayer extends BBoxFeatureSource implements FeatureSourceForLayer {
    readonly layer: FilteredLayer

    constructor(features: FeatureSourceForLayer, mustTouch: Store<BBox>) {
        super(features, mustTouch)
        this.layer = features.layer
    }
}
