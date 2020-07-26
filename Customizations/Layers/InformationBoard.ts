import {LayerDefinition} from "../LayerDefinition";
import FixedText from "../Questions/FixedText";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";
import {TagRenderingOptions} from "../TagRendering";
import {And, Tag} from "../../Logic/TagsFilter";

export class InformationBoard extends LayerDefinition {
    constructor() {
        super({
            name: "Informatiebord",
            description: "Een informatiebord of kaart",
            minzoom: 12,
            overpassFilter: new Tag("tourism", "information"),
            newElementTags: [new Tag("tourism", "information")],
            maxAllowedOverlapPercentage: 0,
            icon: "assets/nature/info.png",
        });

        const isMap = new Tag("information", "map");
        const isOsmSource = new Tag("map_source", "OpenStreetMap");

        this.title = new TagRenderingOptions({
            mappings: [
                {k: isMap, txt: "Kaart"},
                {k:null, txt: "Informatiebord"}
            ]
        });

        this.style = (properties) => {
            let icon = "assets/nature/info.png";
            if (isMap.matchesProperties(properties)) {
                icon = "assets/map.svg";
                if (isOsmSource.matchesProperties(properties)) {
                    icon = "assets/osm-logo-white-bg.svg";

                    const attr = properties["map_source:attribution"];
                    if (attr == "sticker") {
                        icon = "assets/map-stickered.svg"
                    } else if (attr == "no") {
                        icon = "assets/osm-logo-buggy-attr.svg"
                    }
                }
            }

            return {
                color: "#000000",
                icon: {
                    iconUrl: icon,
                    iconSize: [50, 50]
                }
            };
        }


        this.elementsToShow = [

            new ImageCarouselWithUploadConstructor(),
            
            new TagRenderingOptions({
                question: "Heeft dit informatiebord een kaart?",
                mappings: [
                    {k: new Tag("information","board"), txt: "Dit is een informatiebord"},
                    {k: isMap, txt: "Dit is een kaart"}
                ]
            }),

            new TagRenderingOptions({
                question: "Is this map based on OpenStreetMap?",
                mappings: [
                    {
                        k: isOsmSource,
                        txt: "This map is based on OpenStreetMap"
                    },
                    {
                        k: new And([new Tag("map_source:attribution", ""), new Tag("map_source","")]),
                        txt: "Unknown"
                    },
                ],
                freeform: {
                    key: "map_source",
                    extraTags: new Tag("map_source:attribution", ""),
                    renderTemplate: "The map data is based on {map_source}",
                    template: "The map data is based on $$$"
                }
            }).OnlyShowIf(isMap),
            new TagRenderingOptions({
                question: "Is the attribution present?",
                mappings: [
                    {
                        k: new Tag("map_source:attribution", "yes"),
                        txt: "OpenStreetMap is clearly attribute, including the ODBL-license"
                    },
                    {
                        k: new Tag("map_source:attribution", "incomplete"),
                        txt: "OpenStreetMap is clearly attribute, but the license is not mentioned"
                    },
                    {
                        k: new Tag("map_source:attribution", "sticker"),
                        txt: "OpenStreetMap wasn't mentioned, but someone put an OpenStreetMap-sticker on it"
                    },
                    {
                        k: new Tag("map_source:attribution", "no"),
                        txt: "There is no attribution at all"
                    },
                    {
                        k: new Tag("map_source:attribution", "none"),
                        txt: "There is no attribution at all"
                    }
                ]
            }).OnlyShowIf(new Tag("map_source", "OpenStreetMap"))
        ]


    }
}