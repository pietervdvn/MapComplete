import {describe} from 'mocha'
import {expect} from 'chai'
import {LayerConfigJson} from "../../../../Models/ThemeConfig/Json/LayerConfigJson";
import {TagRenderingConfigJson} from "../../../../Models/ThemeConfig/Json/TagRenderingConfigJson";
import LineRenderingConfigJson from "../../../../Models/ThemeConfig/Json/LineRenderingConfigJson";
import {PrepareLayer, RewriteSpecial} from "../../../../Models/ThemeConfig/Conversion/PrepareLayer";
import {
    QuestionableTagRenderingConfigJson
} from "../../../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson";

describe("PrepareLayer", () => {

    it("should expand mappings in map renderings", () => {
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
                            {
                                "if": "parking:condition:left=disc",
                                "then": "#219991"
                            }]
                    },
                    "offset": -6
                }, {
                    "color": {
                        "render": "#888",
                        "mappings": [{
                            "if": "parking:condition:right=free",
                            "then": "#299921"
                        },
                            {
                                "if": "parking:condition:right=disc",
                                "then": "#219991"
                            }]
                    },
                    "offset": 6
                }],
                "titleIcons": [{"render": "defaults", "id": "defaults"}]
            }


            expect(result).deep.eq(expected)
        }
    )
})

describe('RewriteSpecial', function () {
    it("should rewrite the UK import button", () => {
        const tr = <QuestionableTagRenderingConfigJson>{
            "id": "uk_addresses_import_button",
            "render": {
                "special": {
                    "type": "import_button",
                    "targetLayer": "address",
                    "tags": "urpn_count=$urpn_count;ref:GB:uprn=$ref:GB:uprn$",
                    "text": "Add this address",
                    "icon": "./assets/themes/uk_addresses/housenumber_add.svg",
                    "location_picker": "none"
                }
            }
        }
        const r = new RewriteSpecial().convert(tr, "test").result
        expect(r).to.deep.eq({
            "id": "uk_addresses_import_button",
            "render":  {'*': "{import_button(address,urpn_count=$urpn_count;ref:GB:uprn=$ref:GB:uprn$,Add this address,./assets/themes/uk_addresses/housenumber_add.svg,,,,none)}"}
        })
    })
});

