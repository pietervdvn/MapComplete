import {LayerDefinition} from "../LayerDefinition";
import {Quests} from "../Quests";
import {TagMappingOptions} from "../UI/TagMapping";
import L from "leaflet"
import {CommonTagMappings} from "./CommonTagMappings";
import {Tag} from "../Logic/TagsFilter";

export class Playground extends LayerDefinition {

    constructor() {
        super();
        this.name = "speeltuin";
        this.icon = "./assets/tree_white_background.svg";
        this.overpassFilter = new Tag("leisure","playground");
        this.newElementTags = [new Tag("leisure",  "playground"), new Tag( "fixme", "Toegevoegd met MapComplete, geometry nog uit te tekenen")]
        this.removeContainedElements = true;

        this.minzoom = 13;
        this.questions = [Quests.nameOf(this.name)];
        this.style = this.generateStyleFunction();
        this.elementsToShow = [
            new TagMappingOptions({
                key: "name",
                template: "<h2>{name}</h2>",
                missing: "<h2>Naamloos park</h2>"
            }),

            CommonTagMappings.access,
            CommonTagMappings.operator,
            CommonTagMappings.osmLink

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