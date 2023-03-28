import FeatureSource, { FeatureSourceForLayer } from "../FeatureSource"
import { Feature } from "geojson"
import { BBox } from "../../BBox"
import { GeoOperations } from "../../GeoOperations"
import { Store } from "../../UIEventSource"
import FilteredLayer from "../../../Models/FilteredLayer"

/**
 * Allows the retrieval of all features in the requested BBox; useful for one-shot queries;
 *
 * Use a ClippedFeatureSource for a continuously updating featuresource
 */
export default class GeoIndexedStore implements FeatureSource {
    public features: Store<Feature[]>

    constructor(features: FeatureSource | Store<Feature[]>) {
        this.features = features["features"] ?? features
    }

    /**
     * Gets the current features within the given bbox.
     *
     * @param bbox
     * @constructor
     */
    public GetFeaturesWithin(bbox: BBox): Feature[] {
        // TODO optimize
        const bboxFeature = bbox.asGeoJson({})
        return this.features.data.filter(
            (f) => GeoOperations.intersect(f, bboxFeature) !== undefined
        )
    }
}

export class GeoIndexedStoreForLayer extends GeoIndexedStore implements FeatureSourceForLayer {
    readonly layer: FilteredLayer
    constructor(features: FeatureSource | Store<Feature[]>, layer: FilteredLayer) {
        super(features)
        this.layer = layer
    }
}
