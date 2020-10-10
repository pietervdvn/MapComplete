import {LayerDefinition} from "./LayerDefinition";
import {Layout} from "./Layout";
import {FromJSON} from "./JSON/FromJSON";
import * as bookcases from "../assets/themes/bookcases/Bookcases.json";
import * as aed from "../assets/themes/aed/aed.json";
import * as toilets from "../assets/themes/toilets/toilets.json";
import * as artworks from "../assets/themes/artwork/artwork.json";
import * as cyclestreets from "../assets/themes/cyclestreets/cyclestreets.json";
import * as ghostbikes from "../assets/themes/ghostbikes/ghostbikes.json"
import * as cyclofix from "../assets/themes/cyclofix/cyclofix.json"
import * as buurtnatuur from "../assets/themes/buurtnatuur/buurtnatuur.json"
import * as nature from "../assets/themes/nature/nature.json"
import * as maps from "../assets/themes/maps/maps.json"
import * as shops from "../assets/themes/shops/shops.json"
import {PersonalLayout} from "../Logic/PersonalLayout";
import {StreetWidth} from "./StreetWidth/StreetWidth";

export class AllKnownLayouts {

    public static allLayers: Map<string, LayerDefinition> = undefined;

    private static GenerateCycloFix(): Layout {
        const layout = FromJSON.LayoutFromJSON(cyclofix)
        const now = new Date();
        const m = now.getMonth() + 1;
        const day = new Date().getDay() + 1;
        const date = day + "/" + m;
        if (date === "31/10" || date === "1/11" || date === "2/11") {
            // Around Halloween/Fiesta de muerte/Allerzielen, we remember the dead
            layout.layers.push(
                FromJSON.sharedLayers.get("ghost_bike")
            );

        }
        return layout;

    }

    private static GenerateBuurtNatuur(): Layout {
        const layout = FromJSON.LayoutFromJSON(buurtnatuur);
        layout.enableMoreQuests = false;
        layout.enableShareScreen = false;
        layout.hideFromOverview = true;
        return layout;
    }

    public static layoutsList: Layout[] = [
        new PersonalLayout(),
        
        FromJSON.LayoutFromJSON(shops),
        FromJSON.LayoutFromJSON(bookcases),
        FromJSON.LayoutFromJSON(aed),
        FromJSON.LayoutFromJSON(toilets),
        FromJSON.LayoutFromJSON(artworks),
        AllKnownLayouts.GenerateCycloFix(),
        FromJSON.LayoutFromJSON(ghostbikes),
        FromJSON.LayoutFromJSON(nature),
        FromJSON.LayoutFromJSON(cyclestreets),
        FromJSON.LayoutFromJSON(maps),
        AllKnownLayouts.GenerateBuurtNatuur(),

        new StreetWidth(), // The ugly duckling
    ];


    public static allSets: Map<string, Layout> = AllKnownLayouts.AllLayouts();

    private static AllLayouts(): Map<string, Layout> {
        this.allLayers = new Map<string, LayerDefinition>();
        for (const layout of this.layoutsList) {
            for (let i = 0; i < layout.layers.length; i++) {
                let layer = layout.layers[i];
                if (typeof (layer) === "string") {
                    layer = layout.layers[i] = FromJSON.sharedLayers.get(layer);
                    if(layer === undefined){
                        console.log("Defined layers are ", FromJSON.sharedLayers.keys())
                        throw `Layer ${layer} was not found or defined - probably a type was made`
                    }
                }

                if (this.allLayers[layer.id] !== undefined) {
                    continue;
                }
                this.allLayers[layer.id] = layer;
                this.allLayers[layer.id.toLowerCase()] = layer;
            }
        }

        const allSets: Map<string, Layout> = new Map();
        for (const layout of this.layoutsList) {
            allSets[layout.id] = layout;
            allSets[layout.id.toLowerCase()] = layout;
        }
        return allSets;
    }

}
