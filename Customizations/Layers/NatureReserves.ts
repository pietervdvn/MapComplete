import {LayerDefinition} from "../LayerDefinition";
import {Or, Tag} from "../../Logic/TagsFilter";
import {TagRenderingOptions} from "../TagRendering";
import {AccessTag} from "../Questions/AccessTag";
import {OperatorTag} from "../Questions/OperatorTag";
import {NameQuestion} from "../Questions/NameQuestion";
import {NameInline} from "../Questions/NameInline";

export class NatureReserves extends LayerDefinition {
    
    constructor() {
        super();
        this.name = "natuurgebied";
        this.icon = "./assets/tree_white_background.svg";
        this.overpassFilter =
            new Or([new Tag("leisure", "nature_reserve"), new Tag("boundary","protected_area")]);
        this.maxAllowedOverlapPercentage = 10;

        this.newElementTags = [new Tag("leisure", "nature_reserve"),
            new Tag("fixme", "Toegevoegd met MapComplete, geometry nog uit te tekenen")]
        this.minzoom = 13;
        this.title =  new NameInline("natuurreservaat");
        this.style = this.generateStyleFunction();
        this.elementsToShow = [
            new NameQuestion(),
            new AccessTag(),
            new OperatorTag(),
        ];
    }


    private generateStyleFunction() {
        const self = this;
        return function (properties: any) {
            let questionSeverity = 0;
            for (const qd of self.elementsToShow) {
                if (qd.IsQuestioning(properties)) {
                    questionSeverity = Math.max(questionSeverity, qd.options.priority ?? 0);
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
                colour = colormapping[questionSeverity];
            }

            return {
                color: colour,
                icon: undefined
            };
        };
    }
    
}