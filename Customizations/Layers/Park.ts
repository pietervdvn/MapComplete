import {LayerDefinition} from "../LayerDefinition";
import {Quests} from "../../Quests";
import {And, Or, Tag} from "../../Logic/TagsFilter";
import {AccessTag} from "../Questions/AccessTag";
import {OperatorTag} from "../Questions/OperatorTag";
import {TagRenderingOptions} from "../TagRendering";
import {NameQuestion} from "../Questions/NameQuestion";
import {NameInline} from "../Questions/NameInline";

export class Park extends LayerDefinition {

    constructor() {
        super();
        this.name = "park";
        this.icon = "./assets/tree_white_background.svg";
        this.overpassFilter =
            new Or([new Tag("leisure", "park"), new Tag("landuse", "village_green")]);
        this.newElementTags = [new Tag("leisure", "park"),
            new Tag("fixme", "Toegevoegd met MapComplete, geometry nog uit te tekenen")];
        this.maxAllowedOverlapPercentage = 25;

        this.minzoom = 13;
        this.style = this.generateStyleFunction();
        this.title = new NameInline("park");
        this.elementsToShow = [new NameQuestion(),
            new TagRenderingOptions({
                question: "Is dit park publiek toegankelijk?",
                mappings: [
                    {k: new Tag("access", "yes"), txt: "Publiek toegankelijk"},
                    {k: new Tag("access", ""), txt: "Publiek toegankelijk"},
                    {k: new Tag("access", "no"), txt: "Niet publiek toegankelijk"},
                    {k: new Tag("access", "guided"), txt: "Enkel met een gids of tijdens activiteiten"},
                ]
            }),
            new TagRenderingOptions({
                question: "Wie beheert dit park?",
                freeform: {
                    key: "operator",
                    renderTemplate: "Dit park wordt beheerd door {operator}",
                    template: "$$$",
                },
                mappings: [{
                    k: null, txt: "De gemeente beheert dit park"
                }]
            })

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