import {LayerDefinition} from "../LayerDefinition";
import L from "leaflet";
import {And, Or, Tag} from "../../Logic/TagsFilter";
import {TagRenderingOptions} from "../TagRendering";
import {NameInline} from "../Questions/NameInline";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";

export class Bookcases extends LayerDefinition {

    constructor() {
        super();

        this.name = "boekenkast";
        this.newElementTags = [new Tag("amenity", "public_bookcase")];
        this.icon = "./assets/bookcase.svg";
        this.overpassFilter = new Tag("amenity", "public_bookcase");
        this.minzoom = 11;

        this.title = new NameInline("ruilboekenkastje");
        this.elementsToShow = [
            new ImageCarouselWithUploadConstructor(),
            new TagRenderingOptions({
                question: "Heeft dit boekenruilkastje een naam?",
                freeform: {
                    key: "name",
                    template: "De naam is $$$",
                    renderTemplate: "", // We don't actually render it, only ask
                    placeholder: "",
                    extraTags: new Tag("noname","")
                },
                mappings: [
                    {k: new Tag("noname", "yes"), txt: "Neen, er is geen naam aangeduid op het boekenruilkastje"},
                ]
            }),
            
            new TagRenderingOptions(
                {
                    question: "Hoeveel boeken passen in dit boekenruilkastje?",
                    freeform: {
                        renderTemplate: "Er passen {capacity} boeken in dit boekenruilkastje",
                        template:  "Er passen $$$ boeken in dit boekenruilkastje",
                        key: "capacity",
                        placeholder: "aantal"
                    },
                }
            ),
            new TagRenderingOptions({
                question: "Wat voor soort boeken heeft dit boekenruilkastje?",
                mappings: [
                    {k: new Tag("books", "children"), txt: "Voornamelijk kinderboeken"},
                    {k: new Tag("books", "adults"), txt: "Voornamelijk boeken voor volwassenen"},
                    {k: new Tag("books", "children;adults"), txt: "Zowel kinderboeken als boeken voor volwassenen"}
                ],
            }),

            new TagRenderingOptions({
                question: "Staat dit boekenruilkastje binnen of buiten?",
                mappings: [
                    {k: new Tag("indoor", "yes"), txt: "Dit boekenruilkastje staat binnen"},
                    {k: new Tag("indoor", "no"), txt: "Dit boekenruilkastje staat buiten"},
                    {k: new Tag("indoor", ""), txt: "Dit boekenruilkastje staat buiten"}
                ]
            }),

            new TagRenderingOptions({
                question: "Is dit boekenruilkastje vrij toegankelijk?",
                mappings: [
                    {k: new Tag("access", "yes"), txt: "Ja, vrij toegankelijk"},
                    {k: new Tag("access", "customers"), txt: "Enkel voor klanten"},
                ]
            }).OnlyShowIf(new Tag("indoor", "yes")),

            new TagRenderingOptions({
                question: "Wie (welke organisatie) beheert dit boekenruilkastje?",
                freeform: {
                    key: "opeartor",
                    renderTemplate: "Dit boekenruilkastje wordt beheerd door {operator}",
                    template: "Dit boekenruilkastje wordt beheerd door $$$"
                }
            }),

            new TagRenderingOptions({
                question: "Zijn er openingsuren voor dit boekenruilkastje?",
                mappings: [
                    {k: new Tag("opening_hours", "24/7"), txt: "Dag en nacht toegankelijk"},
                    {k: new Tag("opening_hours", ""), txt: "Dag en nacht toegankelijk"},
                    {k: new Tag("opening_hours", "sunrise-sunset"), txt: "Van zonsopgang tot zonsondergang"},
                ],
                freeform: {
                    key: "opening_hours",
                    renderTemplate: "De openingsuren zijn {opening_hours}",
                    template: "De openingsuren zijn $$$"
                }
            }), 

            new TagRenderingOptions({
                question: "Is dit boekenruilkastje deel van een netwerk?",
                freeform: {
                    key: "brand",
                    renderTemplate: "Deel van het netwerk {brand}",
                    template: "Deel van het netwerk $$$"
                },
                mappings: [{
                    k: new And([new Tag("brand", "Little Free Library"), new Tag("nobrand", "")]),
                    txt: "Little Free Library"
                },
                    {
                        k: new And([new Tag("brand", ""), new Tag("nobrand", "yes")]),
                        txt: "Maakt geen deel uit van een groter netwerk"
                    }]
            }).OnlyShowIf(new Or([
                new Tag("ref", ""),
                new And([new Tag("ref","*"), new Tag("brand","")])
            ])),

            new TagRenderingOptions({
                question: "Wat is het referentienummer van dit boekenruilkastje?",
                freeform: {
                    key: "ref",
                    template: "Het referentienummer is $$$",
                    renderTemplate: "Gekend als {brand} <b>{ref}</b>"
                },
                mappings: [
                    {k: new And([new  Tag("brand",""), new Tag("nobrand","yes"), new Tag("ref", "")]), txt: "Maakt geen deel uit van een groter netwerk"}
                ]
            }).OnlyShowIf(new Tag("brand","*")),

            new TagRenderingOptions({
                question: "Wanneer werd dit boekenruilkastje geinstalleerd?",
                priority: -1,
                freeform: {
                    key: "start_date",
                    renderTemplate: "Geplaatst op {start_date}",
                    template: "Geplaatst op $$$"
                }
            }),

            new TagRenderingOptions({
                question: "Is er een website waar we er meer informatie is over dit boekenruilkastje?",
                freeform: {
                    key: "website",
                    renderTemplate: "<a href='{website}' target='_blank'>Meer informatie over dit boekenruilkastje</a>",
                    template: "$$$",
                    placeholder: "website"
                }
            }),
            new TagRenderingOptions({
                freeform: {
                    key: "description",
                    renderTemplate: "<b>Beschrijving door de uitbater:</b><br>{description}",
                    template: "$$$",
                }
            })


        ];


        this.style = function (tags) {
            return {
                icon: new L.icon({
                    iconUrl: "assets/bookcase.svg",
                    iconSize: [40, 40]
                }),
                color: "#0000ff"
            };
        }

  
    }


}