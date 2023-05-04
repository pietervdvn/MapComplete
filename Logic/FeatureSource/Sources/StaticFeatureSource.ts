import {FeatureSource} from "../FeatureSource"
import {ImmutableStore, Store} from "../../UIEventSource"
import {Feature} from "geojson"

/**
 * A simple, read only feature store.
 */
export default class StaticFeatureSource<T extends Feature = Feature> implements FeatureSource<T> {
    public readonly features: Store<T[]>

    constructor(
        features:
            | Store<T[]>
            | T[]
            | { features: T[] }
            | { features: Store<T[]> }
    ) {
        if (features === undefined) {
            throw "Static feature source received undefined as source"
        }
        let feats: T[] | Store<T[]>
        if (features["features"]) {
            feats = features["features"]
        } else {
            feats = <T[] | Store<T[]>>features
        }

        if (Array.isArray(feats)) {
            this.features = new ImmutableStore(feats)
        } else {
            this.features = feats
        }
    }

    public static fromGeojson<T extends Feature>(geojson: T[]): StaticFeatureSource<T> {
        return new StaticFeatureSource(geojson)
    }
}
