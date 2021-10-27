import {UIEventSource} from "../../UIEventSource";
import FilteredLayer from "../../../Models/FilteredLayer";
import {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import Hash from "../../Web/Hash";
import {BBox} from "../../BBox";

export default class FilteringFeatureSource implements FeatureSourceForLayer, Tiled {
    public features: UIEventSource<{ feature: any; freshness: Date }[]> =
        new UIEventSource<{ feature: any; freshness: Date }[]>([]);
    public readonly name;
    public readonly layer: FilteredLayer;
    public readonly tileIndex: number
    public readonly bbox: BBox
    private readonly upstream: FeatureSourceForLayer;
    private readonly state: { locationControl: UIEventSource<{ zoom: number }>; selectedElement: UIEventSource<any> };

    constructor(
        state: {
            locationControl: UIEventSource<{ zoom: number }>,
            selectedElement: UIEventSource<any>,
        },
        tileIndex,
        upstream: FeatureSourceForLayer
    ) {
        this.name = "FilteringFeatureSource(" + upstream.name + ")"
        this.tileIndex = tileIndex
        this.bbox = BBox.fromTileIndex(tileIndex)
        this.upstream = upstream
        this.state = state

        this.layer = upstream.layer;
        const layer = upstream.layer;
      
        upstream.features.addCallback(() => {
           this. update();
        });


        layer.appliedFilters.addCallback(_ => {
            this.update()
        })

        this.update();
    }
    public update() {

        const layer = this.upstream.layer;
        const features: { feature: any; freshness: Date }[] = this.upstream.features.data;
        const newFeatures = features.filter((f) => {
            if (
                this.state.selectedElement.data?.id === f.feature.id ||
                f.feature.id === Hash.hash.data) {
                // This is the selected object - it gets a free pass even if zoom is not sufficient or it is filtered away
                return true;
            }

            const isShown = layer.layerDef.isShown;
            const tags = f.feature.properties;
            if (isShown.IsKnown(tags)) {
                const result = layer.layerDef.isShown.GetRenderValue(
                    f.feature.properties
                ).txt;
                if (result !== "yes") {
                    return false;
                }
            }

            const tagsFilter = layer.appliedFilters.data;
            for (const filter of tagsFilter ?? []) {
                const neededTags = filter.filter.options[filter.selected].osmTags
                if (!neededTags.matchesProperties(f.feature.properties)) {
                    // Hidden by the filter on the layer itself - we want to hide it no matter wat
                    return false;
                }
            }


            return true;
        });

        this.features.setData(newFeatures);
    }

}
