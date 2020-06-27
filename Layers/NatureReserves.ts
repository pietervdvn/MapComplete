import {LayerDefinition} from "../LayerDefinition";
import {Quests} from "../Quests";
import {TagMappingOptions} from "../UI/TagMapping";
import L from "leaflet"
import {CommonTagMappings} from "./CommonTagMappings";
import {Or, Tag} from "../Logic/TagsFilter";

export class NatureReserves extends LayerDefinition {
    
    constructor() {
        super();
        this.name = "natuurgebied";
        this.icon = "./assets/tree_white_background.svg";
        this.overpassFilter =
            new Or([new Tag("leisure", "nature_reserve"), new Tag("boundary","protected_area")]);
        this.removeTouchingElements = true;

        this.newElementTags = [new Tag("leisure", "nature_reserve"),
            new Tag("fixme", "Toegevoegd met MapComplete, geometry nog uit te tekenen")]
        this.minzoom = 13;
        this.questions = [Quests.nameOf(this.name), Quests.accessNatureReserve, Quests.operator];
        this.style = this.generateStyleFunction();
        this.elementsToShow = [
            new TagMappingOptions({
                key: "name",
                template: "{name}",
                missing: "Naamloos gebied"
            }),
            CommonTagMappings.access,
            CommonTagMappings.operator,
        ];
    }


    private readonly treeIcon = new L.icon({
        iconUrl: "assets/tree_white_background.svg",
        iconSize: [40, 40]
    })

    private generateStyleFunction() {
        const self = this;
        return function (properties: any) {
            let questionSeverity = 0;
            for (const qd of self.questions) {
                if (qd.isApplicable(properties)) {
                    questionSeverity = Math.max(questionSeverity, qd.severity);
                }
            }

            let colormapping = {
                0: "#00bb00",
                1: "#00ff00",
                10: "#dddd00",
                20: "#ff0000"
            };

            let colour = colormapping[questionSeverity];
            while (colour == undefined) {
                questionSeverity--;
                colormapping[questionSeverity];
            }

            return {
                color: colour,
                icon: self.treeIcon
            };
        };
    }
    
}