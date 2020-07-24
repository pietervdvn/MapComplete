import {LayerDefinition} from "../LayerDefinition";
import {And, Or, Tag} from "../../Logic/TagsFilter";
import {AccessTag} from "../Questions/AccessTag";
import {OperatorTag} from "../Questions/OperatorTag";
import {TagRenderingOptions} from "../TagRendering";
import {NameQuestion} from "../Questions/NameQuestion";
import {NameInline} from "../Questions/NameInline";
import {DescriptionQuestion} from "../Questions/DescriptionQuestion";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";

export class Park extends LayerDefinition {


    private accessByDefault = new TagRenderingOptions({
        question: "Is dit park publiek toegankelijk?",
        mappings: [
            {k: new Tag("access", "yes"), txt: "Publiek toegankelijk"},
            {k: new Tag("access", ""), txt: "Publiek toegankelijk"},
            {k: new Tag("access", "no"), txt: "Niet publiek toegankelijk"},
            {k: new Tag("access", "private"), txt: "Niet publiek toegankelijk, want privaat"},
            {k: new Tag("access", "guided"), txt: "Enkel toegankelijk met een gids of op een activiteit"},
        ],
        freeform: {
            key: "access",
            renderTemplate: "Dit park is niet toegankelijk: {access}",
            template: "De toegankelijkheid van dit park is: $$$"
        },
        priority: 20
    })

    private operatorByDefault = new

    TagRenderingOptions({
        question: "Wie beheert dit park?",
        freeform: {
            key: "operator",
            renderTemplate: "Dit park wordt beheerd door {operator}",
            template: "$$$",
        },
        mappings: [{
            k: null, txt: "De gemeente beheert dit park"
        }],
        priority: 15
    });


    constructor() {
        super();
        this.name = "Park";
        this.icon = undefined;
        this.overpassFilter =
            new Or([new Tag("leisure", "park"), new Tag("landuse", "village_green")]);
        this.newElementTags = [new Tag("leisure", "park"),
            new Tag("fixme", "Toegevoegd met MapComplete, geometry nog uit te tekenen")];
        this.maxAllowedOverlapPercentage = 25;

        this.minzoom = 13;
        this.style = this.generateStyleFunction();
        this.title = new NameInline("park");
        this.elementsToShow = [
            new ImageCarouselWithUploadConstructor(),
            new NameQuestion(),
            this.accessByDefault,
            this.operatorByDefault,
            new DescriptionQuestion("park"),

        ];

    }




    private generateStyleFunction() {
        const self = this;
        return function (properties: any) {
            let questionSeverity = 0;
            for (const qd of self.elementsToShow) {
                if (qd instanceof DescriptionQuestion) {
                    continue;
                }
                if (qd.IsQuestioning(properties)) {
                    questionSeverity = Math.max(questionSeverity, qd.Priority() ?? 0);
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