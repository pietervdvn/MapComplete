import { UIEventSource } from "../../UIEventSource"
import FilteredLayer from "../../../Models/FilteredLayer"
import { FeatureSourceForLayer, Tiled } from "../FeatureSource"
import { BBox } from "../../BBox"
import { Feature } from "geojson"

export default class SimpleFeatureSource implements FeatureSourceForLayer, Tiled {
    public readonly features: UIEventSource<Feature[]>
    public readonly layer: FilteredLayer
    public readonly bbox: BBox = BBox.global
    public readonly tileIndex: number

    constructor(layer: FilteredLayer, tileIndex: number, featureSource?: UIEventSource<Feature[]>) {
        this.layer = layer
        this.tileIndex = tileIndex ?? 0
        this.bbox = BBox.fromTileIndex(this.tileIndex)
        this.features = featureSource ?? new UIEventSource<Feature[]>([])
    }
}
