import {LayerDefinition} from "../LayerDefinition";
import L from "leaflet"
import {And, Regex, Tag} from "../../Logic/TagsFilter";
import {TagRenderingOptions} from "../TagRendering";

export class GrbToFix extends LayerDefinition {

    constructor() {
        super();

        this.name = "grb";
        this.newElementTags = undefined;
        this.icon = "./assets/star.svg";
        this.overpassFilter = new Regex("fixme", "GRB");
        this.minzoom = 13;



        this.style = function (tags) {
            return {
                icon: new L.icon({
                    iconUrl: "assets/star.svg",
                    iconSize: [40, 40],
                    text: "hi"
                }),
                color: "#ff0000"
            };

        }

        this.title = new TagRenderingOptions({
            freeform: {
                key: "fixme",
                renderTemplate: "{fixme}",
                template: "Fixme $$$"
            }
        })

        this.elementsToShow = [

            new TagRenderingOptions(
                {
                    freeform: {
                        key: "addr:street",
                        renderTemplate: "Het adres is {addr:street} <b>{addr:housenumber}</b>",
                        template: "Straat? $$$"
                    }
                }
            ),

            new TagRenderingOptions({

                question: "Wat is het huisnummer?",
                tagsPreprocessor: tags => {
                    const telltale = "GRB thinks that this has number ";
                    const index = tags.fixme.indexOf(telltale);
                    if (index >= 0) {
                        const housenumber = tags.fixme.slice(index + telltale.length);
                        tags["grb:housenumber:human"] = housenumber;
                        tags["grb:housenumber"] = housenumber == "no number" ? "" : housenumber;
                    }
                },
                freeform: {
                    key: "addr:housenumber",
                    template: "Het huisnummer is $$$",
                    renderTemplate: "Het huisnummer is <b>{addr:housenumber}</b>, GRB denkt <i>{grb:housenumber:human}</i>",
                    extraTags: new Tag("fixme", "")
                },
                mappings: [
                    {
                        k: new And([new Tag("addr:housenumber", "{grb:housenumber}"), new Tag("fixme", "")]),
                        txt: "Volg GRB: <b>{grb:housenumber:human}</b>",
                        substitute: true
                    },
                    {
                        k: new And([new Tag("addr:housenumber", "{addr:housenumber}"), new Tag("fixme", "")]),
                        txt: "Volg OSM: <b>{addr:housenumber}</b>",
                        substitute: true
                    }
                ]
            })


        ];
    }


}