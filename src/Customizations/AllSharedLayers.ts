import LayerConfig from "../Models/ThemeConfig/LayerConfig"
import { Utils } from "../Utils"
import * as known_layers from "../assets/generated/known_layers.json"
import { LayerConfigJson } from "../Models/ThemeConfig/Json/LayerConfigJson"

export class AllSharedLayers {
    public static sharedLayers: Map<string, LayerConfig> = AllSharedLayers.getSharedLayers()
    public static getSharedLayersConfigs(): Map<string, LayerConfigJson> {
        const sharedLayers = new Map<string, LayerConfigJson>()
        for (const layer of (known_layers).layers) {
            if(layer.id === undefined){
                console.error("Layer without id! "+JSON.stringify(layer).slice(0,80), known_layers.layers.length)
                continue
            }else{
                console.log("Loaded",layer.id)
            }
            sharedLayers.set(layer.id, <any> layer)
        }

        return sharedLayers
    }
    private static getSharedLayers(): Map<string, LayerConfig> {
        const sharedLayers = new Map<string, LayerConfig>()
        for (const layer of known_layers["layers"]) {
            try {
                // @ts-ignore
                const parsed = new LayerConfig(layer, "shared_layers")
                sharedLayers.set(layer.id, parsed)
            } catch (e) {
                if (!Utils.runningFromConsole) {
                    console.error(
                        "CRITICAL: Could not parse a layer configuration!",
                        layer.id,
                        " due to",
                        e
                    )
                }
            }
        }

        return sharedLayers
    }
}
