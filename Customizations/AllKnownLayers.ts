import LayerConfig from "./JSON/LayerConfig";
import {LayerConfigJson} from "./JSON/LayerConfigJson";
import * as known_layers from "../assets/generated/known_layers_and_themes.json"
import {Utils} from "../Utils";

export default class AllKnownLayers {


    // Must be below the list...
    public static sharedLayers: Map<string, LayerConfig> = AllKnownLayers.getSharedLayers();
    public static sharedLayersJson: Map<string, any> = AllKnownLayers.getSharedLayersJson();
    private static sharedLayersListRaw: LayerConfigJson[] = known_layers.layers;

    private static getSharedLayers(): Map<string, LayerConfig> {
        const sharedLayers = new Map<string, LayerConfig>();
        for (const layer of known_layers.layers) {
            try {
                const parsed = new LayerConfig(layer, "shared_layers")
                sharedLayers.set(layer.id, parsed);
                sharedLayers[layer.id] = parsed;
            } catch (e) {
                if (!Utils.runningFromConsole) {
                    console.error("CRITICAL: Could not parse a layer configuration!", layer.id, " due to", e)
                }
            }
        }
        return sharedLayers;
    }

    private static getSharedLayersJson(): Map<string, any> {
        const sharedLayers = new Map<string, any>();
        for (const layer of known_layers.layers) {
            sharedLayers.set(layer.id, layer);
            sharedLayers[layer.id] = layer;
        }
        return sharedLayers;
    }


}
