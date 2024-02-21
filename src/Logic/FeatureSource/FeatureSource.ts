import { Store, UIEventSource } from "../UIEventSource"
import FilteredLayer from "../../Models/FilteredLayer"
import { Feature } from "geojson"

export interface FeatureSource<T extends Feature = Feature> {
    features: Store<T[]>
}

export interface UpdatableFeatureSource<T extends Feature = Feature> extends FeatureSource<T> {
    /**
     * Forces an update and downloads the data, even if the feature source is supposed to be active
     */
    updateAsync()
}
export interface WritableFeatureSource<T extends Feature = Feature> extends FeatureSource<T> {
    features: UIEventSource<T[]>
}

/**
 * A feature source which only contains features for the defined layer
 */
export interface FeatureSourceForLayer<T extends Feature = Feature> extends FeatureSource<T> {
    readonly layer: FilteredLayer
}

export interface FeatureSourceForTile<T extends Feature = Feature> extends FeatureSource<T> {
    readonly x: number
    readonly y: number
    readonly z: number
}
/**
 * A feature source which is aware of the indexes it contains
 */
export interface IndexedFeatureSource extends FeatureSource {
    readonly featuresById: Store<Map<string, Feature>>
}
