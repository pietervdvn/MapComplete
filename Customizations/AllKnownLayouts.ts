import AllKnownLayers from "./AllKnownLayers";
import * as known_themes from "../assets/generated/known_layers_and_themes.json"
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig";
import LayerConfig from "../Models/ThemeConfig/LayerConfig";
import BaseUIElement from "../UI/BaseUIElement";
import Combine from "../UI/Base/Combine";
import Title from "../UI/Base/Title";
import List from "../UI/Base/List";
import DependencyCalculator from "../Models/ThemeConfig/DependencyCalculator";
import Link from "../UI/Base/Link";

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
    
    
    public static GenOverviewsForSingleLayer(callback: (layer: LayerConfig, element: BaseUIElement) => void): void {
        const allLayers: LayerConfig[] = Array.from(AllKnownLayers.sharedLayers.values())
            .filter(layer => AllKnownLayers.priviliged_layers.indexOf(layer.id) < 0)

        const builtinLayerIds: Set<string> = new Set<string>()
        allLayers.forEach(l => builtinLayerIds.add(l.id))

        const themesPerLayer = new Map<string, string[]>()

        for (const layout of Array.from(AllKnownLayouts.allKnownLayouts.values())) {
            if (layout.hideFromOverview) {
                continue
            }
            for (const layer of layout.layers) {
                if (!builtinLayerIds.has(layer.id)) {
                    continue
                }
                if (!themesPerLayer.has(layer.id)) {
                    themesPerLayer.set(layer.id, [])
                }
                themesPerLayer.get(layer.id).push(layout.id)
            }
        }


        // Determine the cross-dependencies
        const layerIsNeededBy : Map<string, string[]> = new Map<string, string[]>()

        for (const layer of allLayers) {
            for (const dep of DependencyCalculator.getLayerDependencies(layer)) {
                const dependency = dep.neededLayer
                if(!layerIsNeededBy.has(dependency)){
                    layerIsNeededBy.set(dependency, [])
                }
                layerIsNeededBy.get(dependency).push(layer.id)
            }


        }

        AllKnownLayers.sharedLayers.forEach((layer) => {
            const element = layer.GenerateDocumentation(themesPerLayer.get(layer.id),layerIsNeededBy,DependencyCalculator.getLayerDependencies(layer))
            callback(layer, element)
        })
    }

    public static GenLayerOverviewText(): BaseUIElement {
        for (const id of AllKnownLayers.priviliged_layers) {
            if (!AllKnownLayers.sharedLayers.has(id)) {
                throw "Priviliged layer definition not found: " + id
            }
        }

        const allLayers: LayerConfig[] = Array.from(AllKnownLayers.sharedLayers.values())
            .filter(layer => AllKnownLayers.priviliged_layers.indexOf(layer.id) < 0)

        const builtinLayerIds: Set<string> = new Set<string>()
        allLayers.forEach(l => builtinLayerIds.add(l.id))

        const themesPerLayer = new Map<string, string[]>()

        for (const layout of Array.from(AllKnownLayouts.allKnownLayouts.values())) {
            for (const layer of layout.layers) {
                if (!builtinLayerIds.has(layer.id)) {
                    continue
                }
                if (!themesPerLayer.has(layer.id)) {
                    themesPerLayer.set(layer.id, [])
                }
                themesPerLayer.get(layer.id).push(layout.id)
            }
        }


        // Determine the cross-dependencies
        const layerIsNeededBy : Map<string, string[]> = new Map<string, string[]>()

        for (const layer of allLayers) {
            for (const dep of DependencyCalculator.getLayerDependencies(layer)) {
                const dependency = dep.neededLayer
                if(!layerIsNeededBy.has(dependency)){
                    layerIsNeededBy.set(dependency, [])
                }
                layerIsNeededBy.get(dependency).push(layer.id)
            }
            
            
        }
        
        
        
        return new Combine([
            new Title("Special and other useful layers", 1),
            "MapComplete has a few data layers available in the theme which have special properties through builtin-hooks. Furthermore, there are some normal layers (which are built from normal Theme-config files) but are so general that they get a mention here.",
            new Title("Priviliged layers", 1),
            new List(AllKnownLayers.priviliged_layers.map(id => "[" + id + "](#" + id + ")")),
            ...AllKnownLayers.priviliged_layers
                .map(id => AllKnownLayers.sharedLayers.get(id))
                .map((l) => l.GenerateDocumentation(themesPerLayer.get(l.id), layerIsNeededBy, DependencyCalculator.getLayerDependencies(l),AllKnownLayers.added_by_default.indexOf(l.id) >= 0, AllKnownLayers.no_include.indexOf(l.id) < 0)),
            new Title("Normal layers", 1),
            "The following layers are included in MapComplete:",
            new List(Array.from(AllKnownLayers.sharedLayers.keys()).map(id => new Link(id, "./Layers/"+id+".md")))
        ])


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
