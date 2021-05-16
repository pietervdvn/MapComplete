import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import Loc from "../../Models/Loc";
import Hash from "../Web/Hash";

export default class FilteringFeatureSource implements FeatureSource {
    public features: UIEventSource<{ feature: any; freshness: Date }[]> = new UIEventSource<{ feature: any; freshness: Date }[]>([]);
    public readonly name = "FilteringFeatureSource"

    constructor(layers: UIEventSource<{
                    isDisplayed: UIEventSource<boolean>,
                    layerDef: LayerConfig
                }[]>,
                location: UIEventSource<Loc>,
                selectedElement: UIEventSource<any>,
                upstream: FeatureSource) {

        const self = this;

        function update() {

            const layerDict = {};
            if (layers.data.length == 0) {
                console.warn("No layers defined!")
                return;
            }
            for (const layer of layers.data) {
                layerDict[layer.layerDef.id] = layer;
            }

            const features: { feature: any, freshness: Date }[] = upstream.features.data;

            const missingLayers = new Set<string>();

            const newFeatures = features.filter(f => {
                const layerId = f.feature._matching_layer_id;
                
                if(selectedElement.data?.id === f.feature.id || f.feature.id === Hash.hash.data){
                    // This is the selected object - it gets a free pass even if zoom is not sufficient
                    return true;
                }
                
                if (layerId !== undefined) {
                    const layer: {
                        isDisplayed: UIEventSource<boolean>,
                        layerDef: LayerConfig
                    } = layerDict[layerId];
                    if (layer === undefined) {
                        missingLayers.add(layerId)
                        return true;
                    }

                    const isShown = layer.layerDef.isShown
                    const tags = f.feature.properties;
                    if (isShown.IsKnown(tags)) {
                        const result = layer.layerDef.isShown.GetRenderValue(f.feature.properties).txt;
                        if (result !== "yes") {
                            return false;
                        }
                    }

                    if (FilteringFeatureSource.showLayer(layer, location)) {
                        return true;
                    }
                }
                // Does it match any other layer - e.g. because of a switch?
                for (const toCheck of layers.data) {
                    if (!FilteringFeatureSource.showLayer(toCheck, location)) {
                        continue;
                    }
                    if (toCheck.layerDef.source.osmTags.matchesProperties(f.feature.properties)) {
                        return true;
                    }
                }
                return false;

            });
            console.log("Filtering layer source: input: ", upstream.features.data?.length, "output:", newFeatures.length)
            self.features.setData(newFeatures);
            if (missingLayers.size > 0) {
                console.error("Some layers were not found: ", Array.from(missingLayers))
            }
        }


        upstream.features.addCallback(() => {
            update()
        });
        location.map(l => {
            // We want something that is stable for the shown layers
            const displayedLayerIndexes = [];
            for (let i = 0; i < layers.data.length; i++) {
                const layer = layers.data[i];
                if (l.zoom < layer.layerDef.minzoom) {
                    continue;
                }
                if (l.zoom > layer.layerDef.maxzoom) {
                    continue;
                }
                if (!layer.isDisplayed.data) {
                    continue;
                }
                displayedLayerIndexes.push(i);
            }
            return displayedLayerIndexes.join(",")
        }).addCallback(() => {
            update();
        });

        layers.addCallback(update);

        const registered = new Set<UIEventSource<boolean>>();
        layers.addCallbackAndRun(layers => {
            for (const layer of layers) {
                if (registered.has(layer.isDisplayed)) {
                    continue;
                }
                registered.add(layer.isDisplayed);
                layer.isDisplayed.addCallback(() => update());
            }
        })

        update();

    }

    private static showLayer(layer: {
        isDisplayed: UIEventSource<boolean>,
        layerDef: LayerConfig
    }, location: UIEventSource<Loc>) {
        return layer.isDisplayed.data && (layer.layerDef.minzoom <= location.data.zoom) && (layer.layerDef.maxzoom >= location.data.zoom)
    }
}