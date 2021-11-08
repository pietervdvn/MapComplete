import * as known_layers from "../assets/generated/known_layers_and_themes.json"
import {Utils} from "../Utils";
import LayerConfig from "../Models/ThemeConfig/LayerConfig";
import BaseUIElement from "../UI/BaseUIElement";
import Combine from "../UI/Base/Combine";
import Title from "../UI/Base/Title";
import List from "../UI/Base/List";
import {AllKnownLayouts} from "./AllKnownLayouts";
import {isNullOrUndefined} from "util";
import {Layer} from "leaflet";

export default class AllKnownLayers {


    // Must be below the list...
    public static sharedLayers: Map<string, LayerConfig> = AllKnownLayers.getSharedLayers();
    public static sharedLayersJson: Map<string, any> = AllKnownLayers.getSharedLayersJson();


    public static added_by_default: string[] = ["gps_location", "home_location", "gps_track"]
    public static no_include: string[] = [ "conflation", "left_right_style"]
    /**
     * Layer IDs of layers which have special properties through built-in hooks
     */
    public static priviliged_layers: string[] = [...AllKnownLayers.added_by_default, "type_node",...AllKnownLayers.no_include]



    private static getSharedLayers(): Map<string, LayerConfig> {
        const sharedLayers = new Map<string, LayerConfig>();
        for (const layer of known_layers.layers) {
            try {
                // @ts-ignore
                const parsed = new LayerConfig(layer, "shared_layers")
                sharedLayers.set(layer.id, parsed);
            } catch (e) {
                if (!Utils.runningFromConsole) {
                    console.error("CRITICAL: Could not parse a layer configuration!", layer.id, " due to", e)
                }
            }
        }

        for (const layout of known_layers.themes) {
            for (const layer of layout.layers) {
                if (typeof layer === "string") {
                    continue;
                }
                if (layer.builtin !== undefined) {
                    // This is a builtin layer of which stuff is overridden - skip
                    continue;
                }
                try {
                    const parsed = new LayerConfig(layer, "shared_layer_in_theme")
                    sharedLayers.set(layer.id, parsed);
                    sharedLayers[layer.id] = parsed;
                } catch (e) {
                    if (!Utils.runningFromConsole) {
                        console.error("Could not parse a layer in theme ", layout.id, "due to", e)
                    }
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
