import FeatureSource, { FeatureSourceForLayer, Tiled } from "../FeatureSource"
import { ImmutableStore, Store } from "../../UIEventSource"
import FilteredLayer from "../../../Models/FilteredLayer"
import { BBox } from "../../BBox"
import { Feature } from "geojson"

/**
 * A simple, read only feature store.
 */
export default class StaticFeatureSource implements FeatureSource {
    public readonly features: Store<Feature[]>

    constructor(
        features:
            | Store<Feature[]>
            | Feature[]
            | { features: Feature[] }
            | { features: Store<Feature[]> }
    ) {
        if (features === undefined) {
            throw "Static feature source received undefined as source"
        }
        let feats: Feature[] | Store<Feature[]>
        if (features["features"]) {
            feats = features["features"]
        } else {
            feats = <Feature[] | Store<Feature[]>>features
        }

        if (Array.isArray(feats)) {
            this.features = new ImmutableStore(feats)
        } else {
            this.features = feats
        }
    }

    public static fromGeojson(geojson: Feature[]): StaticFeatureSource {
        return new StaticFeatureSource(geojson)
    }
}

export class TiledStaticFeatureSource
    extends StaticFeatureSource
    implements Tiled, FeatureSourceForLayer
{
    public readonly bbox: BBox = BBox.global
    public readonly tileIndex: number
    public readonly layer: FilteredLayer

    constructor(features: Store<Feature[]>, layer: FilteredLayer, tileIndex: number = 0) {
        super(features)
        this.tileIndex = tileIndex
        this.layer = layer
        this.bbox = BBox.fromTileIndex(this.tileIndex)
    }
}
