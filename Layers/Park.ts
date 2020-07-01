import {LayerDefinition} from "../LayerDefinition";
import {Quests} from "../Quests";
import {TagMappingOptions} from "../UI/TagMapping";
import {CommonTagMappings} from "./CommonTagMappings";
import {Or, Tag} from "../Logic/TagsFilter";

export class Park extends LayerDefinition {

    constructor() {
        super();
        this.name = "park";
        this.icon = "./assets/tree_white_background.svg";
        this.overpassFilter = 
            new Or([new Tag("leisure","park"), new Tag("landuse","village_green")]);
        this.newElementTags = [new Tag("leisure", "park"), 
            new Tag("fixme", "Toegevoegd met MapComplete, geometry nog uit te tekenen")];
        this.maxAllowedOverlapPercentage = 25;

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
                icon: undefined
            };
        };
    }

}