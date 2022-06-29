import FeatureSource, {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import {ImmutableStore, Store, UIEventSource} from "../../UIEventSource";
import {stat} from "fs";
import FilteredLayer from "../../../Models/FilteredLayer";
import {BBox} from "../../BBox";

/**
 * A simple, read only feature store.
 */
export default class StaticFeatureSource implements FeatureSource {
    public readonly features: Store<{ feature: any; freshness: Date }[]>;
    public readonly name: string

    constructor(features: Store<{ feature: any, freshness: Date }[]>, name = "StaticFeatureSource") {
        if (features === undefined) {
            throw "Static feature source received undefined as source"
        }
        this.name = name;
        this.features = features;
    }

    public static fromGeojsonAndDate(features: { feature: any, freshness: Date }[], name = "StaticFeatureSourceFromGeojsonAndDate"): StaticFeatureSource {
        return new StaticFeatureSource(new ImmutableStore(features), name);
    }


    public static fromGeojson(geojson: any[], name = "StaticFeatureSourceFromGeojson"): StaticFeatureSource {
        const now = new Date();
        return StaticFeatureSource.fromGeojsonAndDate(geojson.map(feature => ({feature, freshness: now})), name);
    }

    static fromDateless(featureSource: Store<{ feature: any }[]>, name = "StaticFeatureSourceFromDateless") {
        const now = new Date();
        return new StaticFeatureSource(featureSource.map(features => features.map(feature => ({
            feature: feature.feature,
            freshness: now
        }))), name);
    }
}

export class TiledStaticFeatureSource extends StaticFeatureSource implements Tiled, FeatureSourceForLayer{

    public readonly bbox: BBox = BBox.global;
    public readonly tileIndex: number;   
    public readonly layer: FilteredLayer;

    constructor(features: Store<{ feature: any, freshness: Date }[]>, layer: FilteredLayer ,tileIndex : number = 0) {
        super(features);
        this.tileIndex = tileIndex ;
        this.layer=  layer;
        this.bbox = BBox.fromTileIndex(this.tileIndex)
    }


}
