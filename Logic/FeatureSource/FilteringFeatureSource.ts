import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import Loc from "../../Models/Loc";

export default class FilteringFeatureSource implements FeatureSource {
    public features: UIEventSource<{ feature: any; freshness: Date }[]> = new UIEventSource<{ feature: any; freshness: Date }[]>([]);

    constructor(layers: UIEventSource<{
                    isDisplayed: UIEventSource<boolean>,
                    layerDef: LayerConfig
                }[]>,
                location: UIEventSource<Loc>,
                upstream: FeatureSource) {

        const self = this;


        function update() {

            const layerDict = {};
            for (const layer of layers.data) {
                layerDict[layer.layerDef.id] = layer;
            }

            console.log("Updating the filtering layer, input ", upstream.features.data.length, "features")
            const features: { feature: any, freshness: Date }[] = upstream.features.data;


            const newFeatures = features.filter(f => {
                const layerId = f.feature._matching_layer_id;
                
                if (layerId !== undefined) {
                    const layer: {
                        isDisplayed: UIEventSource<boolean>,
                        layerDef: LayerConfig
                    } = layerDict[layerId];
                    if (layer === undefined) {
                        console.error("No layer found with id ", layerId);
                        return true;
                    }
                    
                    const isShown = layer.layerDef.isShown
                    const tags = f.feature.properties;
                    console.log("Is shown: ", isShown," known? ", isShown.IsKnown(tags), " result: ", isShown.GetRenderValue(tags).txt)
                    if(isShown.IsKnown(tags)){
                        const result = layer.layerDef.isShown.GetRenderValue(f.feature.properties).txt;
                        if(result !== "yes"){
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
            console.log("Updating the filtering layer, output ", newFeatures.length, "features")

            self.features.setData(newFeatures);
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
                if(l.zoom > layer.layerDef.maxzoom){
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
                if(registered.has(layer.isDisplayed)){
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