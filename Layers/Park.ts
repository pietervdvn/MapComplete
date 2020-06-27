import {LayerDefinition} from "../LayerDefinition";
import {Quests} from "../Quests";
import {TagMappingOptions} from "../UI/TagMapping";
import L from "leaflet"
import {CommonTagMappings} from "./CommonTagMappings";
import {Tag} from "../Logic/TagsFilter";

export class Park extends LayerDefinition {

    constructor() {
        super();
        this.name = "park";
        this.icon = "./assets/tree_white_background.svg";
        this.overpassFilter = new Tag("leisure","park");
        this.newElementTags = [new Tag("leisure", "park"), 
            new Tag("fixme", "Toegevoegd met MapComplete, geometry nog uit te tekenen")];
        this.removeTouchingElements = true;

        this.minzoom = 13;
        this.questions = [Quests.nameOf("park")];
        this.style = this.generateStyleFunction();
        this.elementsToShow = [
            new TagMappingOptions({
                key: "name",
                template: "{name}",
                missing: "Naamloos park"
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