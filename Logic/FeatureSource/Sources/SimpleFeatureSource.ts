import {FeatureSourceForLayer} from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import FilteredLayer from "../../Models/FilteredLayer";

export default class SimpleFeatureSource implements FeatureSourceForLayer {
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]> = new UIEventSource<{ feature: any; freshness: Date }[]>([]);
    public readonly name: string = "SimpleFeatureSource";
    public readonly layer: FilteredLayer;

    constructor(layer: FilteredLayer) {
        this.name = "SimpleFeatureSource("+layer.layerDef.id+")"
        this.layer = layer
    }


}