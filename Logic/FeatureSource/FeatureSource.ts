import {Store, UIEventSource} from "../UIEventSource";
import FilteredLayer from "../../Models/FilteredLayer";
import {BBox} from "../BBox";

export default interface FeatureSource {
    features: Store<{ feature: any, freshness: Date }[]>;
    /**
     * Mainly used for debuging
     */
    name: string;
}

export interface Tiled {
    tileIndex: number,
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

/**
 * A feature source which has some extra data about it's state
 */
export interface FeatureSourceState {
    readonly sufficientlyZoomed: Store<boolean>;
    readonly runningQuery: Store<boolean>;
    readonly timeout: Store<number>;
}
