import {LayerDefinition} from "../LayerDefinition";
import {And, Or, Tag} from "../../Logic/TagsFilter";
import * as L from "leaflet";
import FixedText from "../Questions/FixedText";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";
import {TagRenderingOptions} from "../TagRendering";

export class BikePumps extends LayerDefinition {

    constructor() {
        super();
        this.name = "pomp";
        this.icon = "./assets/bike_pump.svg";

        this.overpassFilter =
            new Or([
                new And([
                    new Tag("amenity", "compressed_air"),
                    new Tag("bicycle", "yes")
                ]),
                new And([
                    new Tag("amenity", "bicycle_repair_station"),
                    new Tag("service:bicycle:pump", "yes"),
                   /* new Or([
                        new Tag("service:bicycle:tools", ""),
                        new Tag("service:bicycle:tools", "no"),
                    ])*/
                ]),
            ]);

        this.newElementTags = [
            new Tag("amenity", "bicycle_repair_station"),
            new Tag("service:bicycle:pump", "yes"),
        ];
        
        this.maxAllowedOverlapPercentage = 10;

        this.minzoom = 13;
        const self = this;
        this.style = (properties: any) => {

            return {
                color: "#00bb00",
                icon: new L.icon({
                    iconUrl: self.icon,
                    iconSize: [40, 40]
                })
            };
        };
        
        
        this.title = new FixedText("Pomp");
        this.elementsToShow = [
            new ImageCarouselWithUploadConstructor(),

            new TagRenderingOptions({
                question: "What valves are supported?",
                mappings: [
                    {
                        k: new Tag("valves", " sclaverand;schrader;dunlop"),
                        txt: "There is a default head, so Presta, Dunlop and Auto"
                    },
                    {k: new Tag("valves", "dunlop"), txt: "Only dunlop"},
                    {k: new Tag("valves", "sclaverand"), txt: "Only Sclaverand (also known as Dunlop)"},
                    {k: new Tag("valves", "auto"), txt: "Only auto"},
                ],
                freeform: {
                    key: "valves",
                    template: "Supported valves are $$$",
                    renderTemplate: "Supported valves are {valves}"
                }
            }),

            new TagRenderingOptions({
                question: "Who maintains this bicycle pump?",
                freeform: {
                    key: "operator",
                    template: "Maintained by $$$",
                    renderTemplate: "Maintained by {operator}",
                    placeholder: "operator"
                }
            }),

            new TagRenderingOptions({
                question: "Does the pump have a pressure indicator or manometer?",
                mappings: [
                    {k: new Tag("manometer", "yes"), txt: "Yes, there is a manometer"},
                    {k: new Tag("manometer", "yes"), txt: "No"}
                ]

            }),

           /* new TagRenderingOptions({
                question: "Is dit een manuele pomp?",
                mappings: [
                    {k: new Tag("manual", "yes"), txt: "Manuele pomp"},
                    {k: new Tag("manual", "no"), txt: "Automatische pomp"}
                ]
            })  */
        ];

    }



}