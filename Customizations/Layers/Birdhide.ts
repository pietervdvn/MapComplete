import {LayerDefinition} from "../LayerDefinition";
import {And, Or, Tag} from "../../Logic/TagsFilter";
import {TagRenderingOptions} from "../TagRendering";
import FixedText from "../Questions/FixedText";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";
import L from "leaflet";

export class Birdhide extends LayerDefinition {

    private static readonly birdhide = new Tag("leisure", "bird_hide");


    constructor() {
        super({
            name: "vogelkijkplaats",
            overpassFilter: Birdhide.birdhide,
            elementsToShow: [new FixedText("hi")],
            icon: "assets/nature/birdhide.svg",
            minzoom: 12,
            wayHandling: LayerDefinition.WAYHANDLING_CENTER_AND_WAY,
            newElementTags: [Birdhide.birdhide],
            style(tags: any): { color: string; icon: any } {
                return {color: "", icon: undefined};
            },
        });

        function rmStart(toRemove: string, title: string): string {
            if (title.toLowerCase().indexOf(toRemove.toLowerCase()) == 0) {
                return title.substr(toRemove.length).trim();
            }
            return title;

        }

        function rmStarts(toRemove: string[], title: string) {
            for (const toRm of toRemove) {
                title = rmStart(toRm, title);
            }
            return title;
        }

        this.title = new TagRenderingOptions({
            tagsPreprocessor: (tags) => {
                if (tags.name) {
                    const nm =
                        rmStarts(
                            ["Vogelkijkhut", "Vogelkijkwand", "Kijkwand", "Kijkhut"],
                            tags.name);

                    tags.name = " '" + nm + "'";
                } else {
                    tags.name = "";
                }
            },
            mappings: [
                {
                    k: new And([new Tag("shelter", "no"), new Tag("building", "")]),
                    txt: "Vogelkijkwand{name}"
                },
                {
                    k: new And([new Tag("amenity", "shelter"), new Tag("building", "yes")]),
                    txt: "Vogelijkhut{name}"
                },
                {
                    k: new Tag("amenity", "shelter"),
                    txt: "Vogelijkhut{name}"
                },
                {
                    k: new Tag("shelter", "yes"),
                    txt: "Vogelijkhut{name}"
                },
                {
                    k: new Tag("amenity", "shelter"),
                    txt: "Vogelijkhut{name}"
                },
                {
                    k: new Tag("building", "yes"),
                    txt: "Vogelijkhut{name}"
                },
                {k: null, txt: "Vogelkijkplaats{name}"}
            ]
        });


        this.style = (properties) => {
            let icon = "assets/nature/birdhide.svg";
            if (new Or([new Tag("amenity", "shelter"), new Tag("building", "yes"), new Tag("shelter", "yes")]).matchesProperties(properties)) {
                icon = "assets/nature/birdshelter.svg";
            }

            return {
                color: "#0000bb",
                icon: L.icon({
                    iconUrl: icon,
                    iconSize: [40,40],
                    iconAnchor: [20,20]
                })
            }
        }


        this.elementsToShow = [
            new ImageCarouselWithUploadConstructor(),

            new TagRenderingOptions({
                question: "Is dit een kijkwand of kijkhut?",
                mappings: [
                    {
                        k: new And([new Tag("shelter", "no"), new Tag("building", ""), new Tag("amenity", "")]),
                        txt: "Vogelkijkwand"
                    },
                    {
                        k: new And([new Tag("amenity", "shelter"), new Tag("building", "yes"), new Tag("shelter", "yes")]),
                        txt: "Vogelijkhut"
                    },
                    {
                        k: new Or([new Tag("amenity", "shelter"), new Tag("building", "yes"), new Tag("shelter", "yes")]),
                        txt: "Vogelijkhut"
                    },
                 
                ]
            }),
            new TagRenderingOptions({
                question: "Is ze rolstoeltoegankelijk?",
                mappings: [
                    {
                        k: new Tag("wheelchair", "no"),
                        txt: "Niet rolstoeltoegankelijk"
                    },
                    {
                        k: new Tag("wheelchair", "limited"),
                        txt: "Een rolstoel raakt er, maar het is niet makkelijk"
                    },
                    {
                        k: new Tag("wheelchair", "yes"),
                        txt: "Een rolstoel raakt er gemakkelijk"
                    }
                ]
            }),

            new TagRenderingOptions({
                question: "Wie beheert deze?",
                freeform: {
                    key: "operator",
                    template: "Beheer door $$$",
                    renderTemplate: "Beheer door {operator}",
                    placeholder: "organisatie"
                },
                mappings: [
                    {k: new Tag("operator", "Natuurpunt"), txt: "Natuurpunt"},
                    {k: new Tag("operator", "Agentschap Natuur en Bos"), txt: "het Agentschap Natuur en Bos (ANB)"},

                ]
            })


        ];

    }
}