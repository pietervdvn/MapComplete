import LayoutConfig from "../../../../src/Models/ThemeConfig/LayoutConfig"
import { FixLegacyTheme } from "../../../../src/Models/ThemeConfig/Conversion/LegacyJsonConvert"
import { describe, expect, it } from "vitest"

import { ConversionContext } from "../../../../src/Models/ThemeConfig/Conversion/ConversionContext"

describe("FixLegacyTheme", () => {
    it("should create a working theme config", () => {
        const walking_node_theme = {
            id: "walkingnodenetworks",
            title: {
                en: "Walking node networks",
            },
            maintainer: "L'imaginaire",
            icon: "https://upload.wikimedia.org/wikipedia/commons/3/30/Man_walking_icon_1410105361.svg",
            description: {
                en: "This map shows walking node networks",
            },
            language: ["en"],
            socialImage: "img.jpg",
            version: "2021-10-02",
            startLat: 51.1599,
            startLon: 3.3475,
            startZoom: 12,
            clustering: {
                maxZoom: 12,
            },
            layers: [
                {
                    id: "node2node",
                    name: {
                        en: "node to node links",
                    },
                    source: {
                        osmTags: {
                            and: ["network=rwn", "network:type=node_network"],
                        },
                    },
                    minzoom: 12,
                    title: {
                        render: {
                            en: "node to node link",
                        },
                        mappings: [
                            {
                                if: "ref~*",
                                then: {
                                    en: "node to node link <strong>{ref}</strong>",
                                },
                            },
                        ],
                    },
                    width: {
                        render: "4",
                    },
                    color: {
                        render: "#8b1e20",
                    },
                    tagRenderings: [
                        {
                            question: {
                                en: "When was this node to node link last surveyed?",
                            },
                            render: {
                                en: "This node to node link was last surveyed on {survey:date}",
                            },
                            freeform: {
                                key: "survey:date",
                                type: "date",
                            },
                            mappings: [
                                {
                                    if: "survey:date:={_now:date}",
                                    then: "Surveyed today!",
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "node",
                    name: {
                        en: "nodes",
                    },
                    source: {
                        osmTags: "rwn_ref~*",
                    },
                    minzoom: 12,
                    title: {
                        render: {
                            en: "walking node <strong>{rwn_ref}</strong>",
                        },
                    },
                    label: {
                        mappings: [
                            {
                                if: "rwn_ref~*",
                                then: "<div style='position: absolute; top: 10px; right: 10px; color: white; background-color: #8b1e20; width: 20px; height: 20px; border-radius: 100%'>{rwn_ref}</div>",
                            },
                        ],
                    },
                    tagRenderings: [
                        {
                            question: {
                                en: "When was this walking node last surveyed?",
                            },
                            render: {
                                en: "This walking node was last surveyed on {survey:date}",
                            },
                            freeform: {
                                key: "survey:date",
                                type: "date",
                            },
                            mappings: [
                                {
                                    if: "survey:date:={_now:date}",
                                    then: "Surveyed today!",
                                },
                            ],
                        },
                        {
                            question: {
                                en: "How many other walking nodes does this node link to?",
                            },
                            render: {
                                en: "This node links to {expected_rwn_route_relations} other walking nodes.",
                            },
                            freeform: {
                                key: "expected_rwn_route_relations",
                                type: "int",
                            },
                        },
                        "images",
                    ],
                },
            ],
        }
        const context = ConversionContext.test()
        const fixed = new FixLegacyTheme().convert(<any>walking_node_theme, context)
        // "Could not fix the legacy theme"
        expect(!context.hasErrors())
        const theme = new LayoutConfig(fixed, false)
        expect(theme).toBeDefined()
    })
})
