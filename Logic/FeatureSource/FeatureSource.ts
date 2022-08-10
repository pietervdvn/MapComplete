import {Store, UIEventSource} from "../UIEventSource";
import FilteredLayer from "../../Models/FilteredLayer";
import {BBox} from "../BBox";
import {Feature, Geometry} from "@turf/turf";
import {OsmFeature} from "../../Models/OsmFeature";

export default interface FeatureSource {
    features: Store<{ feature: OsmFeature, freshness: Date }[]>;
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
