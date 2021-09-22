import {UIEventSource} from "../../UIEventSource";
import FilteredLayer from "../../../Models/FilteredLayer";
import {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import {BBox} from "../../GeoOperations";
import {Utils} from "../../../Utils";

export default class SimpleFeatureSource implements FeatureSourceForLayer, Tiled {
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]> = new UIEventSource<{ feature: any; freshness: Date }[]>([]);
    public readonly name: string = "SimpleFeatureSource";
    public readonly layer: FilteredLayer;
    public readonly bbox: BBox = BBox.global;
    public readonly tileIndex: number = Utils.tile_index(0, 0, 0);

    constructor(layer: FilteredLayer) {
        this.name = "SimpleFeatureSource(" + layer.layerDef.id + ")"
        this.layer = layer
    }

}