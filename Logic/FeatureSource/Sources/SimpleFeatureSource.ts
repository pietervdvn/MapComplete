import {UIEventSource} from "../../UIEventSource";
import FilteredLayer from "../../../Models/FilteredLayer";
import {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import {BBox} from "../../BBox";

export default class SimpleFeatureSource implements FeatureSourceForLayer, Tiled {
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]>;
    public readonly name: string = "SimpleFeatureSource";
    public readonly layer: FilteredLayer;
    public readonly bbox: BBox = BBox.global;
    public readonly tileIndex: number;

    constructor(layer: FilteredLayer, tileIndex: number, featureSource?: UIEventSource<{ feature: any; freshness: Date }[]>) {
        this.name = "SimpleFeatureSource(" + layer.layerDef.id + ")"
        this.layer = layer
        this.tileIndex = tileIndex ?? 0;
        this.bbox = BBox.fromTileIndex(this.tileIndex)
        this.features = featureSource ?? new UIEventSource<{ feature: any; freshness: Date }[]>([]);
    }

}