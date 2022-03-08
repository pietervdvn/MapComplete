import T from "./TestHelper";
import {FixLegacyTheme} from "../Models/ThemeConfig/Conversion/LegacyJsonConvert";
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig";
import {TagRenderingConfigJson} from "../Models/ThemeConfig/Json/TagRenderingConfigJson";
import {AddMiniMap} from "../Models/ThemeConfig/Conversion/PrepareTheme";
import {DetectMappingsWithImages, DetectShadowedMappings} from "../Models/ThemeConfig/Conversion/Validation";
import * as Assert from "assert";
import {ExtractImages, FixImages} from "../Models/ThemeConfig/Conversion/FixImages";
import {PrepareLayer} from "../Models/ThemeConfig/Conversion/PrepareLayer";
import {LayerConfigJson} from "../Models/ThemeConfig/Json/LayerConfigJson";
import LineRenderingConfigJson from "../Models/ThemeConfig/Json/LineRenderingConfigJson";

export default class LegacyThemeLoaderSpec extends T {

    private static readonly walking_node_theme = {
        "id": "walkingnodenetworks",
        "title": {
            "en": "Walking node networks"
        },
        "maintainer": "L'imaginaire",
        "icon": "https://upload.wikimedia.org/wikipedia/commons/3/30/Man_walking_icon_1410105361.svg",
        "description": {
            "en": "This map shows walking node networks"
        },
        "language": [
            "en"
        ],
        socialImage: "img.jpg",
        "version": "2021-10-02",
        "startLat": 51.1599,
        "startLon": 3.34750,
        "startZoom": 12,
        "clustering": {
            "maxZoom": 12
        },
        "layers": [
            {
                "id": "node2node",
                "name": {
                    "en": "node to node links"
                },
                "source": {
                    "osmTags": {
                        "and": [
                            "network=rwn",
                            "network:type=node_network"
                        ]
                    }
                },
                "minzoom": 12,
                "title": {
                    "render": {
                        "en": "node to node link"
                    },
                    "mappings": [
                        {
                            "if": "ref~*",
                            "then": {
                                "en": "node to node link <strong>{ref}</strong>"
                            }
                        }
                    ]
                },
                "width": {
                    "render": "4"
                },
                "color": {
                    "render": "#8b1e20"
                },
                "tagRenderings": [
                    {
                        "question": {
                            "en": "When was this node to node link last surveyed?"
                        },
                        "render": {
                            "en": "This node to node link was last surveyed on {survey:date}"
                        },
                        "freeform": {
                            "key": "survey:date",
                            "type": "date"
                        },
                        "mappings": [
                            {
                                "if": "survey:date:={_now:date}",
                                "then": "Surveyed today!"
                            }
                        ]
                    }
                ]
            },
            {
                "id": "node",
                "name": {
                    "en": "nodes"
                },
                "source": {
                    "osmTags": "rwn_ref~*"
                },
                "minzoom": 12,
                "title": {
                    "render": {
                        "en": "walking node <strong>{rwn_ref}</strong>"
                    }
                },
                "label": {
                    "mappings": [
                        {
                            "if": "rwn_ref~*",
                            "then": "<div style='position: absolute; top: 10px; right: 10px; color: white; background-color: #8b1e20; width: 20px; height: 20px; border-radius: 100%'>{rwn_ref}</div>"
                        }
                    ]
                },
                "tagRenderings": [
                    {
                        "question": {
                            "en": "When was this walking node last surveyed?"
                        },
                        "render": {
                            "en": "This walking node was last surveyed on {survey:date}"
                        },
                        "freeform": {
                            "key": "survey:date",
                            "type": "date"
                        },
                        "mappings": [
                            {
                                "if": "survey:date:={_now:date}",
                                "then": "Surveyed today!"
                            }
                        ]
                    },
                    {
                        "question": {
                            "en": "How many other walking nodes does this node link to?"
                        },
                        "render": {
                            "en": "This node links to {expected_rwn_route_relations} other walking nodes."
                        },
                        "freeform": {
                            "key": "expected_rwn_route_relations",
                            "type": "int"
                        }
                    },
                    "images"
                ]
            }
        ]
    }

    private static readonly verkeerde_borden = {
        "id": "https://raw.githubusercontent.com/seppesantens/MapComplete-Themes/main/VerkeerdeBordenDatabank/VerkeerdeBordenDatabank.json",
        "title": {
            "nl": "VerkeerdeBordenDatabank",
            "en": "Erratic Signs Database"
        },
        "maintainer": "Seppe Santens",
        "icon": "https://upload.wikimedia.org/wikipedia/commons/b/bc/Belgian_traffic_sign_A51.svg",
        "description": {
            "nl": "Een kaart om verkeerde of ontbrekende verkeersborden te tonen en te editeren.",
            "en": "A map to show and edit incorrect or missing traffic signs."
        },
        "version": "2021-09-16",
        "startLat": 51.08881,
        "startLon": 3.447282,
        "startZoom": 15,
        "clustering": {
            "maxZoom": 8
        },
        "layers": [
            {
                "id": "trafficsign",
                "name": {
                    "nl": "verkeersbord",
                    "en": "traffic sign"
                },
                "source": {
                    "osmTags": {
                        "and": [
                            "traffic_sign~*",
                            "traffic_sign:issue~*"
                        ]
                    }
                },
                "minzoom": 10,
                "title": {
                    "render": {
                        "nl": "verkeersbord",
                        "en": "traffic sign"
                    }
                },
                "tagRenderings": [
                    "images",
                    {
                        "render": {
                            "nl": "ID verkeersbord: {traffic_sign}",
                            "en": "traffic sign ID: {traffic_sign}"
                        },
                        "question": {
                            "nl": "Wat is het ID voor dit verkeersbord?",
                            "en": "What is ID for this traffic sign?"
                        },
                        "freeform": {
                            "key": "traffic_sign"
                        },
                        "id": "trafficsign-traffic_sign"
                    },
                    {
                        "render": {
                            "nl": "Probleem bij dit verkeersbord: {traffic_sign:issue}",
                            "en": "Issue with this traffic sign: {traffic_sign:issue}"
                        },
                        "question": {
                            "nl": "Wat is het probleem met dit verkeersbord?",
                            "en": "What is the issue with this traffic sign?"
                        },
                        "freeform": {
                            "key": "traffic_sign:issue"
                        },
                        "id": "trafficsign-traffic_sign:issue"
                    },
                    {
                        "question": {
                            "nl": "Wanneer werd dit verkeersbord laatst gesurveyed?",
                            "en": "When was this traffic sign last surveyed?"
                        },
                        "render": {
                            "nl": "Dit verkeersbord werd laatst gesurveyed op {survey:date}",
                            "en": "This traffic sign was last surveyed on {survey:date}"
                        },
                        "freeform": {
                            "key": "survey:date",
                            "type": "date"
                        },
                        "mappings": [
                            {
                                "if": "survey:date:={_now:date}",
                                "then": "Vandaag gesurveyed!"
                            }
                        ],
                        "id": "trafficsign-survey:date"
                    }
                ],
                "mapRendering": [
                    {
                        "icon": "./TS_bolt.svg",
                        iconBadges: [{
                            if: "id=yes",
                            then: {
                                mappings: [
                                    {
                                        if: "id=yes",
                                        then: "./Something.svg"
                                    }
                                ]
                            }
                        }],
                        "location": [
                            "point",
                            "centroid"
                        ]
                    }
                ]
            },
            {
                "id": "notrafficsign",
                "name": {
                    "nl": "geen verkeersbord",
                    "en": "no traffic sign"
                },
                "source": {
                    "osmTags": {
                        "and": [
                            {
                                "or": [
                                    "no:traffic_sign~*",
                                    "not:traffic_sign~*"
                                ]
                            },
                            "traffic_sign:issue~*"
                        ]
                    }
                },
                "minzoom": 10,
                "title": {
                    "render": {
                        "nl": "ontbrekend verkeersbord",
                        "en": "missing traffic sign"
                    }
                },
                "tagRenderings": [
                    "images",
                    {
                        "render": {
                            "nl": "ID ontbrekend verkeersbord: {no:traffic_sign}",
                            "en": "missing traffic sign ID: {no:traffic_sign}"
                        },
                        "question": {
                            "nl": "Wat is het ID voor het ontbrekende verkeersbord?",
                            "en": "What is ID for the missing traffic sign?"
                        },
                        "freeform": {
                            "key": "no:traffic_sign"
                        },
                        "id": "notrafficsign-no:traffic_sign"
                    },
                    {
                        "render": {
                            "nl": "Probleem bij deze situatie: {traffic_sign:issue}",
                            "en": "Issue with this situation: {traffic_sign:issue}"
                        },
                        "question": {
                            "nl": "Wat is er mis met deze situatie?",
                            "en": "What is the issue with this situation?"
                        },
                        "freeform": {
                            "key": "traffic_sign:issue"
                        },
                        "id": "notrafficsign-traffic_sign:issue"
                    },
                    {
                        "question": {
                            "nl": "Wanneer werd deze situatie laatst gesurveyed?",
                            "en": "When was this situation last surveyed?"
                        },
                        "render": {
                            "nl": "Deze situatie werd laatst gesurveyed op {survey:date}",
                            "en": "This situation was last surveyed on {survey:date}"
                        },
                        "freeform": {
                            "key": "survey:date",
                            "type": "date"
                        },
                        "mappings": [
                            {
                                "if": "survey:date:={_now:date}",
                                "then": "Vandaag gesurveyed!"
                            }
                        ],
                        "id": "notrafficsign-survey:date"
                    }
                ],
                "mapRendering": [
                    {
                        "icon": "./TS_questionmark.svg",
                        "location": [
                            "point",
                            "centroid"
                        ]
                    }
                ]
            }
        ],
        "defaultBackgroundId": "Stamen.TonerLite"
    }


    constructor() {
        super([
                ["Walking_node_theme", () => {

                    const config = LegacyThemeLoaderSpec.walking_node_theme
                    const fixed = new FixLegacyTheme().convert(
                        // @ts-ignore
                        config,
                        "While testing")
                    T.isTrue(fixed.errors.length === 0, "Could not fix the legacy theme")
                    const theme = new LayoutConfig(fixed.result)

                }],
                ["Detect minimaps", () => {
                    function shouldHave(config: TagRenderingConfigJson) {
                        T.equals(AddMiniMap.hasMinimap(config), true, "Did _not_ dected a minimap, even though there is one in " + JSON.stringify(config))
                    }

                    function shouldNot(config: TagRenderingConfigJson) {
                        T.equals(AddMiniMap.hasMinimap(config), false, "Did erronously dected a minimap, even though there is none in " + JSON.stringify(config))
                    }

                    shouldHave({
                        render: "{minimap()}"
                    });
                    shouldHave({
                        render: {en: "{minimap()}"}
                    });
                    shouldHave({
                        render: {en: "{minimap()}", nl: "{minimap()}"}
                    });
                    shouldHave({
                        render: {en: "{minimap()}", nl: "No map for the dutch!"}
                    });

                    shouldHave({
                        render: "{minimap()}"
                    })
                    shouldHave({
                        render: "{minimap(18,featurelist)}"
                    })
                    shouldHave({
                        mappings: [
                            {
                                if: "xyz=abc",
                                then: "{minimap(18,featurelist)}"
                            }
                        ]
                    })
                    shouldNot({
                        render: "Some random value {key}"
                    })
                    shouldNot({
                        render: "Some random value {minimap}"
                    })

                }],
                ["Shadowed mappings are detected",
                    () => {
                        const r = new DetectShadowedMappings().convert({
                            mappings: [
                                {
                                    if: {or: ["key=value", "x=y"]},
                                    then: "Case A"
                                },
                                {
                                    if: "key=value",
                                    then: "Shadowed"
                                }
                            ]
                        }, "test");
                        T.isTrue(r.warnings.length > 0, "Failing case 0 is not detected")
                        T.isTrue(r.warnings[0].indexOf("The mapping key=value is fully matched by a previous mapping (namely 0)") >= 0, "Error message does not contain tag and indices")
                        const r0 = new DetectShadowedMappings().convert({
                            mappings: [
                                {
                                    if: {or: ["key=value", "x=y"]},
                                    then: "Case A"
                                },
                                {
                                    if: {and: ["key=value", "x=y"]},
                                    then: "Shadowed"
                                }
                            ]
                        }, "test");
                        T.isTrue(r0.warnings.length > 0, "Failing case 1 is not detected")
                    }
                ],
                ["Images are rewritten", () => {
                    const fixed = new FixImages(new Set<string>()).convertStrict(LegacyThemeLoaderSpec.verkeerde_borden, "test")
                    const fixedValue = fixed.layers[0]["mapRendering"][0].icon
                    Assert.equal("https://raw.githubusercontent.com/seppesantens/MapComplete-Themes/main/VerkeerdeBordenDatabank/TS_bolt.svg",
                        fixedValue)

                    const fixedMapping = fixed.layers[0]["mapRendering"][0].iconBadges[0].then.mappings[0].then
                    Assert.equal("https://raw.githubusercontent.com/seppesantens/MapComplete-Themes/main/VerkeerdeBordenDatabank/Something.svg",
                        fixedMapping)
                }],
                ["Images in simple mappings are detected", () => {
                    const r = new DetectMappingsWithImages().convert({
                        "mappings": [
                            {
                                "if": "bicycle_parking=stands",
                                "then": {
                                    "en": "Staple racks <img style='width: 25%' src='./assets/layers/bike_parking/staple.svg'>",
                                    "nl": "Nietjes <img style='width: 25%'' src='./assets/layers/bike_parking/staple.svg'>",
                                    "fr": "Arceaux <img style='width: 25%'' src='./assets/layers/bike_parking/staple.svg'>",
                                    "gl": "De roda (Stands) <img style='width: 25%'' src='./assets/layers/bike_parking/staple.svg'>",
                                    "de": "Fahrradbügel <img style='width: 25%'' src='./assets/layers/bike_parking/staple.svg'>",
                                    "hu": "Korlát <img style='width: 25%' src='./assets/layers/bike_parking/staple.svg'>",
                                    "it": "Archetti <img style='width: 25%' src='./assets/layers/bike_parking/staple.svg'>",
                                    "zh_Hant": "單車架 <img style='width: 25%' src='./assets/layers/bike_parking/staple.svg'>"
                                }
                            }]
                    }, "test");
                    const errors = r.errors;
                    T.isTrue(errors.length > 0, "No images found");
                    T.isTrue(errors.some(msg => msg.indexOf("./assets/layers/bike_parking/staple.svg") >= 0), "staple.svg not mentioned");
                }],
                ["Images in 'thens' are detected in QuestionableTagRenderings", () => {
                    const r = new ExtractImages(true, new Map<string, any>()).convert(<any>{
                        "layers": [
                            {
                                tagRenderings: [
                                    {
                                        "mappings": [
                                            {
                                                "if": "bicycle_parking=stands",
                                                "then": {
                                                    "en": "Staple racks",
                                                },
                                                "icon": {
                                                    path: "./assets/layers/bike_parking/staple.svg",
                                                    class: "small"
                                                }
                                            },
                                            {
                                                "if": "bicycle_parking=stands",
                                                "then": {
                                                    "en": "Bollard",
                                                },
                                                "icon": "./assets/layers/bike_parking/bollard.svg",
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }, "test");
                    const images = r.result
                    T.isTrue(images.length > 0, "No images found");
                    T.isTrue(images.findIndex(img => img == "./assets/layers/bike_parking/staple.svg") >= 0, "staple.svg not mentioned");
                    T.isTrue(images.findIndex(img => img == "./assets/layers/bike_parking/bollard.svg") >= 0, "bollard.svg not mentioned");
                }],
                ["Rotation and colours is not detected as image", () => {
                    const r = new ExtractImages(true, new Map<string, any>()).convert(<any>{
                        "layers": [
                            {
                                mapRendering: [
                                    {
                                        "location": ["point", "centroid"],
                                        "icon": "pin:black",
                                        rotation: 180,
                                        iconSize: "40,40,center"
                                    }
                                ]
                            }
                        ]
                    }, "test");
                    const images = r.result
                    T.isTrue(images.length > 0, "No images found");
                    T.isTrue(images.length < 2, "To much images found: " + images.join(", "));
                    T.isTrue(images[0] === "pin", "pin not mentioned");
                }],
                ["Test expansion in map renderings", () => {
                    const exampleLayer: LayerConfigJson = {
                        id: "testlayer",
                        source: {
                            osmTags: "key=value"
                        },
                        mapRendering: [
                            {
                                "rewrite": {
                                    sourceString: ["left|right", "lr_offset"],
                                    into: [
                                        ["left", "right"],
                                        [-6, +6]
                                    ]
                                },
                                renderings: <LineRenderingConfigJson>{
                                    "color": {
                                        "render": "#888",
                                        "mappings": [
                                            {
                                                "if": "parking:condition:left|right=free",
                                                "then": "#299921"
                                            },
                                            {
                                                "if": "parking:condition:left|right=disc",
                                                "then": "#219991"
                                            }
                                        ]
                                    },
                                    "offset": "lr_offset"
                                }
                            }
                        ]
                    }
                    const prep = new PrepareLayer({
                        tagRenderings: new Map<string, TagRenderingConfigJson>(),
                        sharedLayers: new Map<string, LayerConfigJson>()
                    })
                    const result = prep.convertStrict(exampleLayer, "test")

                    const expected = {
                        "id": "testlayer",
                        "source": {"osmTags": "key=value"},
                        "mapRendering": [{
                            "color": {
                                "render": "#888",
                                "mappings": [{
                                    "if": "parking:condition:left=free",
                                    "then": "#299921"
                                }, 
                                    {"if": "parking:condition:left=disc",
                                        "then": "#219991"}]
                            }, 
                            "offset":   -6
                        }, {
                            "color": {
                                "render": "#888",
                                "mappings": [{
                                    "if": "parking:condition:right=free",
                                    "then": "#299921"
                                }, 
                                    {"if": "parking:condition:right=disc",
                                        "then": "#219991"}]
                            }, 
                            "offset": 6
                        }],
                        "titleIcons": [{"render": "defaults", "id": "defaults"}]
                    }


                   Assert.equal(JSON.stringify(result), JSON.stringify(expected))
                }

                ],
            ["Advanced rewriting of the mapRendering",() => {
                const source = {"mapRendering": [
                    {
                        "rewrite": {
                            "sourceString": ["left|right", "lr_offset"],
                            "into": [
                                ["left", "right"],
                                [-6, 6]
                            ]
                        },
                        "renderings": [
                            {
                                "color": {
                                    "render": "#888",
                                    "mappings": [
                                        {
                                            "if": "parking:condition:left|right=free",
                                            "then": "#299921"
                                        },
                                        {
                                            "if": "parking:condition:left|right=ticket",
                                            "then": "#219991"
                                        }
                                    ]
                                },
                                "width": {
                                    "render": 6,
                                    "mappings": [
                                        {
                                            "if": {
                                                "or": [
                                                    "parking:lane:left|right=no",
                                                    "parking:lane:left|right=separate"
                                                ]
                                            },
                                            "then": 0
                                        }
                                    ]
                                },
                                "offset": "lr_offset",
                                "lineCap": "butt"
                            }
                        ]
                    }
                ]
            }}
            
            
            ]
            ]
        );
    }


}