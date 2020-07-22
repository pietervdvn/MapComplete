import {LayerDefinition} from "../LayerDefinition";
import {Or, Tag} from "../../Logic/TagsFilter";
import {TagRenderingOptions} from "../TagRendering";
import {AccessTag} from "../Questions/AccessTag";
import {OperatorTag} from "../Questions/OperatorTag";
import {NameQuestion} from "../Questions/NameQuestion";
import {NameInline} from "../Questions/NameInline";
import {DescriptionQuestion} from "../Questions/DescriptionQuestion";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";

export class NatureReserves extends LayerDefinition {
    
    constructor(moreQuests: boolean = false) {
        super();
        this.name = "natuurgebied";
        this.icon = "./assets/tree_white_background.svg";
        this.overpassFilter =
            new Or([new Tag("leisure", "nature_reserve"), new Tag("boundary", "protected_area")]);
        this.maxAllowedOverlapPercentage = 10;

        this.newElementTags = [new Tag("leisure", "nature_reserve"),
            new Tag("fixme", "Toegevoegd met MapComplete, geometry nog uit te tekenen")]
        this.minzoom = 13;
        this.title = new NameInline("natuurreservaat");
        this.style = this.generateStyleFunction();
        this.elementsToShow = [
            new ImageCarouselWithUploadConstructor(),
            new TagRenderingOptions({
                freeform: {
                    key: "_surface",
                    renderTemplate: "{_surface}m²",
                    template: "$$$"
                }
            }),
            new NameQuestion(),
            new AccessTag(),
            new OperatorTag(),
            new DescriptionQuestion("natuurgebied")
        ];


        const extraRenderings = [
            new TagRenderingOptions({
                question: "Mogen honden in dit natuurgebied?",
                mappings: [
                    {k: new Tag("dog", "leashed"), txt: "Honden moeten aan de leiband"},
                    {k: new Tag("dog", "no"), txt: "Honden zijn niet toegestaan"},
                    {k: new Tag("dog", "yes"), txt: "Honden zijn welkom"},
                ]
            }).OnlyShowIf(new Tag("access", "yes")),
            new TagRenderingOptions({
                question: "Op welke website kunnen we meer informatie vinden over dit natuurgebied?",
                freeform: {
                    key:"website",
                    renderTemplate: "<a href='{website}' target='_blank'>Meer informatie</a>",
                    template: "$$$"
                }
            }),
            new TagRenderingOptions({
                question: "Wie is de conservator van dit gebied?<br>" +
                    "<span class='question-subtext'>Geef de naam van de conservator énkel als die duidelijk online staat gepubliceerd.</span>",
                freeform: {
                    renderTemplate: "De conservator van dit gebied is {curator}",
                    template: "$$$",
                    key: "curator"
                }
            }),
            new TagRenderingOptions(
                {
                    question: "Wat is het email-adres van de beheerder?<br>" +
                        "<span class='question-subtext'>Geef bij voorkeur het emailadres van de Natuurpunt-afdeling; geef enkel een email-adres van de conservator als dit duidelijk is gepubliceerd</span>",
                    freeform: {
                        renderTemplate: "Bij problemen of vragen, de conservator kan bereikt worden via " +
                            "<a href='mailto:{email}'>{email}</a>",
                        template: "$$$",
                        key: "email"
                    }
                }),
            new TagRenderingOptions(
                {
                    question: "Wat is het telefoonnummer van de beheerder?<br>" +
                        "<span class='question-subtext'>Geef bij voorkeur het telefoonnummer van de Natuurpunt-afdeling; geef enkel een email-adres van de conservator als dit duidelijk is gepubliceerd</span>",
                    freeform: {
                        renderTemplate: "Bij problemen of vragen, de {conservator} kan bereikt worden via " +
                            "<a href='tel:{phone}'>{phone}</a>",
                        template: "$$$",
                        key: "phone"
                    }

                }),


        ];

        if (moreQuests) {
            this.elementsToShow =
                this.elementsToShow.concat(extraRenderings);
        }


    }


    private generateStyleFunction() {
        const self = this;
        return function (properties: any) {
            let questionSeverity = 0;
            for (const qd of self.elementsToShow) {
                if(qd instanceof DescriptionQuestion){
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