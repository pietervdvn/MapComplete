import { Store, UIEventSource } from "../UIEventSource"
import FilteredLayer from "../../Models/FilteredLayer"
import { BBox } from "../BBox"
import { Feature } from "geojson"

export interface FeatureSource<T extends Feature = Feature> {
    features: Store<T[]>
}
export interface WritableFeatureSource<T extends Feature = Feature> extends FeatureSource<T> {
    features: UIEventSource<T[]>
}

export interface Tiled {
    tileIndex: number
    bbox: BBox
}

/**
 * A feature source which only contains features for the defined layer
 */
export interface FeatureSourceForLayer<T extends Feature = Feature> extends FeatureSource<T> {
    readonly layer: FilteredLayer
}

/**
 * A feature source which is aware of the indexes it contains
 */
export interface IndexedFeatureSource extends FeatureSource {
    readonly featuresById: Store<Map<string, Feature>>
}
