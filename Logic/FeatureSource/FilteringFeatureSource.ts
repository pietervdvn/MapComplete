import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import Loc from "../../Models/Loc";

export default class FilteringFeatureSource implements FeatureSource {
    public features: UIEventSource<{ feature: any; freshness: Date }[]> = new UIEventSource<{ feature: any; freshness: Date }[]>([]);

    constructor(layers: {
                    isDisplayed: UIEventSource<boolean>,
                    layerDef: LayerConfig
                }[],
                location: UIEventSource<Loc>,
                upstream: FeatureSource) {

        const layerDict = {};

        const self = this;

        function update() {
            const features: { feature: any, freshness: Date }[] = upstream.features.data;
            const newFeatures = features.filter(f => {
                const layerId = f.feature._matching_layer_id;
                if (layerId === undefined) {
                    console.error(f)
                    throw "feature._matching_layer_id is undefined"
                }
                const layer: {
                    isDisplayed: UIEventSource<boolean>,
                    layerDef: LayerConfig
                } = layerDict[layerId];
                if (layer === undefined) {
                    throw "No layer found with id " + layerId;
                }
                return layer.isDisplayed.data && (layer.layerDef.minzoom <= location.data.zoom);
            });
            self.features.setData(newFeatures);
        }

        for (const layer of layers) {
            layerDict[layer.layerDef.id] = layer;
        }
        upstream.features.addCallback(() => {
            update()});
        location.map(l => {
            // We want something that is stable for the shown layers
            const displayedLayerIndexes = [];
            for (let i = 0; i < layers.length; i++) {
                if(l.zoom < layers[i].layerDef.minzoom){
                    continue;
                }
                if(!layers[i].isDisplayed.data){
                    continue;
                }
                displayedLayerIndexes.push(i);
            }
            return displayedLayerIndexes.join(",")
        }, layers.map(l => l.isDisplayed))
            .addCallback(() => {
            update();});


    }


}