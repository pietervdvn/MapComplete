import T from "./TestHelper";
import {FixLegacyTheme} from "../Models/ThemeConfig/Conversion/LegacyJsonConvert";
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig";
import {TagRenderingConfigJson} from "../Models/ThemeConfig/Json/TagRenderingConfigJson";
import {ExtractImages} from "../Models/ThemeConfig/Conversion/FixImages";
import {PrepareLayer} from "../Models/ThemeConfig/Conversion/PrepareLayer";
import {LayerConfigJson} from "../Models/ThemeConfig/Json/LayerConfigJson";
import LineRenderingConfigJson from "../Models/ThemeConfig/Json/LineRenderingConfigJson";
import {expect} from "chai";

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



    constructor() {
        super([
                ["should load the Walking_node_theme", () => {

                    const config = LegacyThemeLoaderSpec.walking_node_theme
                    const fixed = new FixLegacyTheme().convert(
                        // @ts-ignore
                        config,
                        "While testing")
                    expect(fixed.errors.length === 0, "Could not fix the legacy theme").true
                    const theme = new LayoutConfig(fixed.result)

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
                    images.length // => 2
                    expect(images.findIndex(img => img == "./assets/layers/bike_parking/staple.svg") >= 0, "staple.svg not mentioned").true
                    expect(images.findIndex(img => img == "./assets/layers/bike_parking/bollard.svg") >= 0, "bollard.svg not mentioned").true
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
                    expect(images.length > 0, "No images found").true
                    expect(images.length < 2, "To much images found: " + images.join(", ")).true
                    expect(images[0] === "pin", "pin not mentioned").true
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


                   expect(result).deep.eq(expected)
                }

                ],
            ]
        );
    }


}