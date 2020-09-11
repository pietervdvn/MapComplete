import {LayerDefinition} from "./LayerDefinition";
import {Layout} from "./Layout";
import {Groen} from "./Layouts/Groen";
import Cyclofix from "./Layouts/Cyclofix";
import {StreetWidth} from "./Layouts/StreetWidth";
import {GRB} from "./Layouts/GRB";
import {MetaMap} from "./Layouts/MetaMap";
import {Natuurpunt} from "./Layouts/Natuurpunt";
import {FromJSON} from "./JSON/FromJSON";
import * as bookcases from "../assets/themes/bookcases/Bookcases.json";
import * as aed from "../assets/themes/aed/aed.json";
import * as toilets from "../assets/themes/toilets/toilets.json";
import * as artworks from "../assets/themes/artwork/artwork.json";
import * as cyclestreets from "../assets/themes/cyclestreets/cyclestreets.json";
import * as ghostbikes from "../assets/themes/ghostbikes/ghostbikes.json"
import {PersonalLayout} from "../Logic/PersonalLayout";

export class AllKnownLayouts {

    public static allLayers: Map<string, LayerDefinition> = undefined;

    public static layoutsList: Layout[] = [
        new PersonalLayout(),
        new Natuurpunt(),
        new GRB(),
        new Cyclofix(),
        FromJSON.LayoutFromJSON(bookcases),
        FromJSON.LayoutFromJSON(aed),
        FromJSON.LayoutFromJSON(toilets),
        FromJSON.LayoutFromJSON(artworks),
        FromJSON.LayoutFromJSON(cyclestreets),
        FromJSON.LayoutFromJSON(ghostbikes),
        
        new MetaMap(),
        new StreetWidth(),
        new Groen(),

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
