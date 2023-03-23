import { Store } from "../UIEventSource"
import FilteredLayer from "../../Models/FilteredLayer"
import { BBox } from "../BBox"
import { Feature } from "geojson"

export default interface FeatureSource {
    features: Store<Feature[]>
}

export interface Tiled {
    tileIndex: number
    bbox: BBox
}

/**
 * A feature source which only contains features for the defined layer
 */
export interface FeatureSourceForLayer extends FeatureSource {
    readonly layer: FilteredLayer
}

/**
 * A feature source which is aware of the indexes it contains
 */
export interface IndexedFeatureSource extends FeatureSource {
    readonly containedIds: Store<Set<string>>
}
