import {UIEventSource} from "../../UIEventSource";
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";
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

    constructor(
        state: {
            locationControl: UIEventSource<{ zoom: number }>,
            selectedElement: UIEventSource<any>,
        },
        tileIndex,
        upstream: FeatureSourceForLayer
    ) {
        const self = this;
        this.name = "FilteringFeatureSource(" + upstream.name + ")"
        this.tileIndex = tileIndex
        this.bbox = BBox.fromTileIndex(tileIndex)

        this.layer = upstream.layer;
        const layer = upstream.layer;
        
        function update() {
            
            const features: { feature: any; freshness: Date }[] = upstream.features.data;
            const newFeatures = features.filter((f) => {
                if (
                    state.selectedElement.data?.id === f.feature.id ||
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

            self.features.setData(newFeatures);
        }

        upstream.features.addCallback(() => {
            update();
        });


        layer.appliedFilters.addCallback(_ => {
            update()
        })

        update();
    }

    private static showLayer(
        layer: {
            isDisplayed: UIEventSource<boolean>;
            layerDef: LayerConfig;
        }) {
        return layer.isDisplayed.data;

    }
}
