import AllKnownLayers from "./AllKnownLayers";
import * as known_themes from "../assets/generated/known_layers_and_themes.json"
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig";
import LayerConfig from "../Models/ThemeConfig/LayerConfig";

export class AllKnownLayouts {


    public static allKnownLayouts: Map<string, LayoutConfig> = AllKnownLayouts.AllLayouts();
    public static layoutsList: LayoutConfig[] = AllKnownLayouts.GenerateOrderedList(AllKnownLayouts.allKnownLayouts);

    public static AllPublicLayers() {
        const allLayers: LayerConfig[] = []
        const seendIds = new Set<string>()
        const publicLayouts = AllKnownLayouts.layoutsList.filter(l => !l.hideFromOverview)
        for (const layout of publicLayouts) {
            if (layout.hideFromOverview) {
                continue
            }
            for (const layer of layout.layers) {
                if (seendIds.has(layer.id)) {
                    continue
                }
                seendIds.add(layer.id)
                allLayers.push(layer)
            }

        }
        return allLayers
    }

    private static GenerateOrderedList(allKnownLayouts: Map<string, LayoutConfig>): LayoutConfig[] {
        const keys = ["personal", "cyclofix", "hailhydrant", "bookcases", "toilets", "aed"]
        const list = []
        for (const key of keys) {
            list.push(allKnownLayouts.get(key))
        }
        allKnownLayouts.forEach((layout, key) => {
            if (keys.indexOf(key) < 0) {
                list.push(layout)
            }
        })
        return list;
    }

    private static AddGhostBikes(layout: LayoutConfig): LayoutConfig {
        const now = new Date();
        const m = now.getMonth() + 1;
        const day = new Date().getDate() + 1;
        const date = day + "/" + m;
        if (date === "31/10" || date === "1/11" || date === "2/11") {
            console.log("The current date is ", date, ", which means we remember our dead")
            // Around Halloween/Fiesta de muerte/Allerzielen, we remember the dead
            layout.layers.push(
                AllKnownLayers.sharedLayers.get("ghost_bike")
            );

        }
        return layout;

    }

    private static AllLayouts(): Map<string, LayoutConfig> {
        const dict: Map<string, LayoutConfig> = new Map();
        for (const layoutConfigJson of known_themes.themes) {
            // @ts-ignore
            const layout = new LayoutConfig(layoutConfigJson, true)

            if (layout.id === "cyclofix") {
                AllKnownLayouts.AddGhostBikes(layout)
            }
            dict.set(layout.id, layout)

            for (let i = 0; i < layout.layers.length; i++) {
                let layer = layout.layers[i];
                if (typeof (layer) === "string") {
                    layer = layout.layers[i] = AllKnownLayers.sharedLayers.get(layer);
                    if (layer === undefined) {
                        console.log("Defined layers are ", AllKnownLayers.sharedLayers.keys())
                        throw `Layer ${layer} was not found or defined - probably a type was made`
                    }
                }

            }
        }
        return dict;
    }

}
