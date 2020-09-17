import {LayerDefinition} from "../LayerDefinition";
import {Or, Tag} from "../../Logic/Tags";
import {NameInline} from "../Questions/NameInline";
import {TagRenderingOptions} from "../TagRenderingOptions";

export class NatureReserves extends LayerDefinition {

    constructor(moreQuests: boolean = false) {
        super("natureReserve");
        this.name = "Natuurgebied";
        this.icon = "";
        this.overpassFilter =
            new Or([new Tag("leisure", "nature_reserve"), new Tag("boundary", "protected_area")]);
        this.maxAllowedOverlapPercentage = 10;

        this.presets = [{
            title: "Natuurreservaat",
            description: "Voeg een ontbrekend, erkend natuurreservaat toe, bv. een gebied dat beheerd wordt door het ANB of natuurpunt",
            tags: [new Tag("leisure", "nature_reserve"),
                new Tag("fixme", "Toegevoegd met MapComplete, geometry nog uit te tekenen")]
        }
        ];
        this.minzoom = 13;
        this.title = new NameInline("Natuurreservaat");
        this.style = function () {
            return {
                color: "#00bb00",
                icon: undefined
            };
        };
        this.elementsToShow = [
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
                        template: "$email$",
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
                        template: "$phone$",
                        key: "phone"
                    }

                }),


        ];

        if (moreQuests) {
            this.elementsToShow =
                this.elementsToShow.concat(extraRenderings);
        }


    }
}