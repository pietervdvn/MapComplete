import {LayerDefinition} from "../LayerDefinition";
import Translations from "../../UI/i18n/Translations";
import {Layout} from "../Layout";
import {ClimbingTree} from "../Layers/ClimbingTree";

export class ClimbingTrees extends Layout {
    constructor() {
        super(
            "climbing_trees",
            ["nl"],
            Translations.t.climbingTrees.layout.title,
            [new ClimbingTree()],
            12,
            50.8435,
            4.3688,
            Translations.t.climbingTrees.layout.welcome
        );
        this.icon = "./assets/themes/nature/tree.svg"
        this.hideFromOverview = true;
    }
}