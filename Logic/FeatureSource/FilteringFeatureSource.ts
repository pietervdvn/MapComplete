import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import Loc from "../../Models/Loc";
import Hash from "../Web/Hash";
import {TagsFilter} from "../Tags/TagsFilter";

export default class FilteringFeatureSource implements FeatureSource {
    public features: UIEventSource<{ feature: any; freshness: Date }[]> =
        new UIEventSource<{ feature: any; freshness: Date }[]>([]);
    public readonly name = "FilteringFeatureSource";

    constructor(
        layers: UIEventSource<{
            isDisplayed: UIEventSource<boolean>;
            layerDef: LayerConfig;
            appliedFilters: UIEventSource<TagsFilter>;
        }[]>,
        location: UIEventSource<Loc>,
        selectedElement: UIEventSource<any>,
        upstream: FeatureSource
    ) {
        const self = this;

        function update() {
            const layerDict = {};
            if (layers.data.length == 0) {
                console.warn("No layers defined!");
                return;
            }
            for (const layer of layers.data) {
                const prev = layerDict[layer.layerDef.id]
                if (prev !== undefined) {
                    // We have seen this layer before!
                    // We prefer the one which has a name
                    if (layer.layerDef.name === undefined) {
                        // This one is hidden, so we skip it
                        console.log("Ignoring layer selection from ", layer)
                        continue;
                    }
                }
                layerDict[layer.layerDef.id] = layer;
            }

            const features: { feature: any; freshness: Date }[] =
                upstream.features.data;

            const missingLayers = new Set<string>();

            const newFeatures = features.filter((f) => {
                const layerId = f.feature._matching_layer_id;

                if (
                    selectedElement.data?.id === f.feature.id ||
                    f.feature.id === Hash.hash.data) {
                    // This is the selected object - it gets a free pass even if zoom is not sufficient or it is filtered away
                    return true;
                }

                if (layerId === undefined) {
                    return false;
                }
                const layer: {
                    isDisplayed: UIEventSource<boolean>;
                    layerDef: LayerConfig;
                    appliedFilters: UIEventSource<TagsFilter>;
                } = layerDict[layerId];
                if (layer === undefined) {
                    missingLayers.add(layerId);
                    return false;
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
                if (!FilteringFeatureSource.showLayer(layer, location)) {
                    // The layer itself is either disabled or hidden due to zoom constraints
                    // We should return true, but it might still match some other layer
                    return false;
                }

                return true;
            });

            self.features.setData(newFeatures);
            if (missingLayers.size > 0) {
                console.error(
                    "Some layers were not found: ",
                    Array.from(missingLayers)
                );
            }
        }

        upstream.features.addCallback(() => {
            update();
        });
        location
            .map((l) => {
                // We want something that is stable for the shown layers
                const displayedLayerIndexes = [];
                for (let i = 0; i < layers.data.length; i++) {
                    const layer = layers.data[i];
                    if (l.zoom < layer.layerDef.minzoom) {
                        continue;
                    }
                 
                    if (!layer.isDisplayed.data) {
                        continue;
                    }
                    displayedLayerIndexes.push(i);
                }
                return displayedLayerIndexes.join(",");
            })
            .addCallback(() => {
                update();
            });

        layers.addCallback(update);

        const registered = new Set<UIEventSource<boolean>>();
        layers.addCallbackAndRun((layers) => {
            for (const layer of layers) {
                if (registered.has(layer.isDisplayed)) {
                    continue;
                }
                registered.add(layer.isDisplayed);
                layer.isDisplayed.addCallback(() => update());
                layer.appliedFilters.addCallback(() => update());
            }
        });

        update();
    }

    private static showLayer(
        layer: {
            isDisplayed: UIEventSource<boolean>;
            layerDef: LayerConfig;
        },
        location: UIEventSource<Loc>
    ) {
        return (
            layer.isDisplayed.data &&
            layer.layerDef.minzoomVisible <= location.data.zoom
        );
    }
}
