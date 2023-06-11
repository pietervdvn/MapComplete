import { UIEventSource } from "../../UIEventSource"
import FilteredLayer from "../../../Models/FilteredLayer"
import { FeatureSourceForLayer } from "../FeatureSource"
import { Feature } from "geojson"

export default class SimpleFeatureSource implements FeatureSourceForLayer {
    public readonly features: UIEventSource<Feature[]>
    public readonly layer: FilteredLayer

    constructor(layer: FilteredLayer, featureSource?: UIEventSource<Feature[]>) {
        this.layer = layer
        this.features = featureSource ?? new UIEventSource<Feature[]>([])
    }
}
