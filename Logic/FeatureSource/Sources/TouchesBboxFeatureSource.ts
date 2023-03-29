import FeatureSource, { FeatureSourceForLayer } from "../FeatureSource"
import StaticFeatureSource from "./StaticFeatureSource"
import { GeoOperations } from "../../GeoOperations"
import { BBox } from "../../BBox"
import FilteredLayer from "../../../Models/FilteredLayer"

/**
 * Results in a feature source which has all the elements that touch the given features
 */
export default class BBoxFeatureSource extends StaticFeatureSource {
    constructor(features: FeatureSource, mustTouch: BBox) {
        const bbox = mustTouch.asGeoJson({})
        super(
            features.features.mapD((features) =>
                features.filter((feature) => GeoOperations.intersect(feature, bbox) !== undefined)
            )
        )
    }
}

export class BBoxFeatureSourceForLayer extends BBoxFeatureSource implements FeatureSourceForLayer {
    constructor(features: FeatureSourceForLayer, mustTouch: BBox) {
        super(features, mustTouch)
        this.layer = features.layer
    }

    readonly layer: FilteredLayer
}
