import {UIEventSource} from "../../UIEventSource";
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";
import FilteredLayer from "../../../Models/FilteredLayer";
import {FeatureSourceForLayer} from "../FeatureSource";
import Hash from "../../Web/Hash";

export default class FilteringFeatureSource implements FeatureSourceForLayer {
    public features: UIEventSource<{ feature: any; freshness: Date }[]> =
        new UIEventSource<{ feature: any; freshness: Date }[]>([]);
    public readonly name;
    public readonly layer: FilteredLayer;

    constructor(
        state: {
            locationControl: UIEventSource<{ zoom: number }>,
            selectedElement: UIEventSource<any>,
        },
        upstream: FeatureSourceForLayer
    ) {
        const self = this;
        this.name = "FilteringFeatureSource("+upstream.name+")"

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
                if (tagsFilter) {
                    if (!tagsFilter.matchesProperties(f.feature.properties)) {
                        // Hidden by the filter on the layer itself - we want to hide it no matter wat
                        return false;
                    }
                }
                if (!FilteringFeatureSource.showLayer(layer, state.locationControl.data)) {
                    // The layer itself is either disabled or hidden due to zoom constraints
                    // We should return true, but it might still match some other layer
                    return false;
                }
                return true;
            });

            self.features.setData(newFeatures);
        }

        upstream.features.addCallback(() => {
            update();
        });

        let isShown = state.locationControl.map((l) => FilteringFeatureSource.showLayer(layer, l),
            [layer.isDisplayed])
            
        isShown.addCallback(isShown => {
            if (isShown) {
                update();
            } else {
                self.features.setData([])
            }
        });

        layer.appliedFilters.addCallback(_ => {
            if(!isShown.data){
                // Currently not shown.
                // Note that a change in 'isSHown' will trigger an update as well, so we don't have to watch it another time
                return;
            }
            update()
        })

        update();
    }

    private static showLayer(
        layer: {
            isDisplayed: UIEventSource<boolean>;
            layerDef: LayerConfig;
        },
        location: { zoom: number }) {
        return layer.isDisplayed.data &&
            layer.layerDef.minzoomVisible <= location.zoom;

    }
}
