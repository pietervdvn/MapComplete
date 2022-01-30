import T from "./TestHelper";
import {FixLegacyTheme} from "../Models/ThemeConfig/Conversion/LegacyJsonConvert";
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig";
import {LayerConfigJson} from "../Models/ThemeConfig/Json/LayerConfigJson";
import {TagRenderingConfigJson} from "../Models/ThemeConfig/Json/TagRenderingConfigJson";
import {AddMiniMap} from "../Models/ThemeConfig/Conversion/PrepareTheme";
import FixRemoteLinks from "../Models/ThemeConfig/Conversion/FixRemoteLinks";

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

    private static readonly organic_waste_theme = {
        "id": "recycling-organic",
        "title": {
            "nl": "Inzamelpunt organisch alval"
        },
        "shortDescription": {
            "nl": "Inzamelpunt organisch alval"
        },
        "description": {
            "nl": "Op deze kaart vindt u inzamelpunten voor organisch afval. Beheer deze naar goeddunken en vermogen."
        },
        "language": [
            "nl"
        ],
        "maintainer": "",
        "icon": "https://upload.wikimedia.org/wikipedia/commons/1/15/Compost_…able_waste_-_biodegradable_waste_-_biological_waste_icon.png",
        "version": "0",
        "startLat": 0,
        "startLon": 0,
        "startZoom": 1,
        "widenFactor": 0.05,
        "socialImage": "",
        "layers": [
            {
                "id": "recycling-organic",
                "name": {
                    "nl": "Inzamelpunt organisch alval"
                },
                "minzoom": 12,
                "title": {
                    "render": {
                        "nl": "Inzamelpunt organisch alval"
                    },
                    "mappings": [
                        {
                            "if": {
                                "and": [
                                    "name~*"
                                ]
                            },
                            "then": {
                                "nl": "{name}"
                            }
                        }
                    ]
                },
                "allowMove": true,
                "deletion": {},
                "tagRenderings": [
                    "images",
                    {
                        "freeform": {
                            "key": "opening_hours",
                            "type": "opening_hours",
                            "addExtraTags": []
                        },
                        "question": {
                            "nl": "Wat zijn de openingsuren?"
                        },
                        "render": {
                            "nl": "{opening_hours_table()}"
                        },
                        "mappings": [
                            {
                                "if": {
                                    "and": [
                                        "opening_hours=\"by appointment\""
                                    ]
                                },
                                "then": {
                                    "nl": "Op afspraak"
                                }
                            }
                        ],
                        "id": "Composthoekjes-opening_hours"
                    },
                    {
                        "question": {
                            "nl": "Wat is de website voor meer informatie?"
                        },
                        "freeform": {
                            "key": "website",
                            "type": "url"
                        },
                        "render": {
                            "nl": "<a href=\"{website}\">{website}</a>"
                        },
                        "id": "Composthoekjes-website"
                    },
                    {
                        "question": {
                            "nl": "Wat is het type inzamelpunt?"
                        },
                        "mappings":[
                            {
                                "if":"recycling_type=container",
                                "then":"Container of vat"
                            },
                            {
                                "if":"recycling_type=centre",
                                "then":"Verwerkingsplaats of containerpark"
                            },
                            {
                                "if":"recycling_type=dump",
                                "then":"Composthoop"
                            }

                        ],
                        "id": "Composthoekjes-type"
                    },
                    {
                        "question": {
                            "nl": "Wie mag hier organisch afval bezorgen?"
                        },
                        "mappings":[
                            {
                                "if":"access=yes",
                                "then":"Publiek toegankelijk"
                            },
                            {
                                "if":"access=no",
                                "then":"Privaat"
                            },
                            {
                                "if":"access=permessive",
                                "then":"Mogelijks toegelaten tot nader order"
                            },
                            {
                                "if":"access=",
                                "then":"Waarschijnlijk publiek toegankelijk",
                                "hideInAnswer":true
                            },
                            {
                                "if":"access=residents",
                                "then":"Bewoners van gemeente",
                                "hideInAnswer":"recycling_type!=centre"
                            }

                        ],
                        "id": "Composthoekjes-voor-wie"
                    },
                    {
                        "question": {
                            "nl": "Wat is de naam van dit compost-inzamelpunt?"
                        },
                        "freeform": {
                            "key": "name",
                            "addExtraTags": ["noname="]
                        },
                        "render": {
                            "nl": "De naam van dit compost-inzamelpunt is {name}"
                        },
                        "mappings":[
                            {
                                "if":{"and":["noname=yes","name="]},
                                "then":"Heeft geen naam"
                            },
                            {
                                "if":"name=",
                                "then":"Geen naam bekend",
                                "hideInAnswer":true
                            }
                        ],
                        "id": "Composthoekjes-name"
                    }],
                "presets": [
                    {
                        "tags": [
                            "amenity=recycling",
                            "recycling:organic=yes"
                        ],
                        "title": {
                            "nl": "een inzamelpunt voor organisch afval"
                        }
                    }
                ],
                "source": {
                    "osmTags": {
                        "and": [
                            "recycling:organic~*"
                        ]
                    }
                },
                "mapRendering": [
                    {
                        "icon": {
                            "render": "circle:white;https://upload.wikimedia.org/wikipedia/commons/1/15/Compost_…able_waste_-_biodegradable_waste_-_biological_waste_icon.png"
                        },
                        "iconSize": {
                            "render": "40,40,center"
                        },
                        "location": [
                            "point"
                        ]
                    },
                    {
                        "color": {
                            "render": "#00f"
                        },
                        "width": {
                            "render": "8"
                        }
                    }
                ]
            }
        ]
    }


    constructor() {
        super([
                ["Walking_node_theme", () => {

                    const config = LegacyThemeLoaderSpec.walking_node_theme
                    const fixed = new FixLegacyTheme().convert({
                            tagRenderings: new Map<string, TagRenderingConfigJson>(),
                            sharedLayers: new Map<string, LayerConfigJson>()
                        },
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

                }]
            ]
        );
    }


}