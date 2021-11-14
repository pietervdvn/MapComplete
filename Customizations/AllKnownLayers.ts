import * as known_layers from "../assets/generated/known_layers_and_themes.json"
import {Utils} from "../Utils";
import LayerConfig from "../Models/ThemeConfig/LayerConfig";
import {TagRenderingConfigJson} from "../Models/ThemeConfig/Json/TagRenderingConfigJson";
import SharedTagRenderings from "./SharedTagRenderings";
import {LayerConfigJson} from "../Models/ThemeConfig/Json/LayerConfigJson";
import WithContextLoader from "../Models/ThemeConfig/WithContextLoader";

export default class AllKnownLayers {

    public static inited = (_ => {
        WithContextLoader.getKnownTagRenderings = (id => AllKnownLayers.getTagRendering(id))
        return true
    })()


    // Must be below the list...
    public static sharedLayers: Map<string, LayerConfig> = AllKnownLayers.getSharedLayers();
    public static sharedLayersJson: Map<string, any> = AllKnownLayers.getSharedLayersJson();


    public static added_by_default: string[] = ["gps_location", "gps_location_history", "home_location", "gps_track",]
    public static no_include: string[] = ["conflation", "left_right_style"]
    /**
     * Layer IDs of layers which have special properties through built-in hooks
     */
    public static priviliged_layers: string[] = [...AllKnownLayers.added_by_default, "type_node", ...AllKnownLayers.no_include]

    /**
     * Gets the appropriate tagRenderingJSON
     * Allows to steal them from other layers.
     * This will add the tags of the layer to the configuration though!
     * @param renderingId
     */
    static getTagRendering(renderingId: string): TagRenderingConfigJson[] {
        if (renderingId.indexOf(".") < 0) {
            const found = SharedTagRenderings.SharedTagRenderingJson.get(renderingId)
            if(found === undefined){
                return []
            }
            return [found]
        }

        const [layerId, id] = renderingId.split(".")
        const layer = AllKnownLayers.getSharedLayersJson().get(layerId)
        if (layer === undefined) {
            if (Utils.runningFromConsole) {
                // Probably generating the layer overview
                return <TagRenderingConfigJson[]>[{
                    id: "dummy"
                }]
            }
            throw "Builtin layer " + layerId + " not found"
        }

        const renderings = layer?.tagRenderings ?? []
        if (id === "*") {
            return <TagRenderingConfigJson[]>JSON.parse(JSON.stringify(renderings))
        }

        const selectByGroup = id.startsWith("*")
        const expectedGroupName = id.substring(1)

        const allValidValues = []
        for (const rendering of renderings) {
            if ((!selectByGroup && rendering["id"] === id) || (selectByGroup && rendering["group"] === expectedGroupName)) {
                const found = <TagRenderingConfigJson>JSON.parse(JSON.stringify(rendering))
                if (found.condition === undefined) {
                    found.condition = layer.source.osmTags
                } else {
                    found.condition = {and: [found.condition, layer.source.osmTags]}
                }
                allValidValues.push(found)
            }
        }
        if(allValidValues.length === 0){
            
        throw `The rendering with id ${id} was not found in the builtin layer ${layerId}. Try one of ${Utils.NoNull(renderings.map(r => r["id"])).join(", ")}`
        }
        return allValidValues
    }

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

    private static getSharedLayersJson(): Map<string, LayerConfigJson> {
        const sharedLayers = new Map<string, any>();
        for (const layer of known_layers.layers) {
            sharedLayers.set(layer.id, layer);
            sharedLayers[layer.id] = layer;
        }
        return sharedLayers;
    }

}
