import {Groen} from "./Layouts/Groen";
import {GRB} from "./Layouts/GRB";
import {Artworks} from "./Layouts/Artworks";
import {Bookcases} from "./Layouts/Bookcases";
import Cyclofix from "./Layouts/Cyclofix";
import {WalkByBrussels} from "./Layouts/WalkByBrussels";
import {All} from "./Layouts/All";
import {Layout} from "./Layout";
import {MetaMap} from "./Layouts/MetaMap";
import {StreetWidth} from "./Layouts/StreetWidth";
import {Natuurpunt} from "./Layouts/Natuurpunt";
import {ClimbingTrees} from "./Layouts/ClimbingTrees";
import {Smoothness} from "./Layouts/Smoothness";
import {LayerDefinition} from "./LayerDefinition";
import {CustomLayout} from "../Logic/CustomLayers";

export class AllKnownLayouts {

    public static allLayers: Map<string, LayerDefinition> = undefined;
    
    public static layoutsList: Layout[] = [
        new CustomLayout(),
        new Groen(),
        new GRB(),
        new Cyclofix(),
        new Bookcases(),
        new WalkByBrussels(),
        new MetaMap(),
        new StreetWidth(),
        new Natuurpunt(),
        new ClimbingTrees(),
        new Artworks(),
        new Smoothness(),
        /*new Toilets(),
        */
    ];

    public static allSets: Map<string, Layout> = AllKnownLayouts.AllLayouts();

    private static AllLayouts(): Map<string, Layout> {

        const all = new All();
        this.allLayers = new Map<string, LayerDefinition>();
        for (const layout of this.layoutsList) {
            for (const layer of layout.layers) {
                const key = layer.id;
                if (this.allLayers[layer.id] !== undefined) {
                    continue;
                }
                this.allLayers[layer.id] = layer;
                all.layers.push(layer);
            }
        }

        const allSets: Map<string, Layout> = new Map();
        for (const layout of this.layoutsList) {
            allSets[layout.name] = layout;
        }
        allSets[all.name] = all;
        return allSets;
    }

}
