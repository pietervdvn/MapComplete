import {describe} from 'mocha'
import {expect} from 'chai'
import {LayerConfigJson} from "../../../../Models/ThemeConfig/Json/LayerConfigJson";
import {TagRenderingConfigJson} from "../../../../Models/ThemeConfig/Json/TagRenderingConfigJson";
import LineRenderingConfigJson from "../../../../Models/ThemeConfig/Json/LineRenderingConfigJson";
import {ExpandRewrite, PrepareLayer} from "../../../../Models/ThemeConfig/Conversion/PrepareLayer";
import RewritableConfigJson from "../../../../Models/ThemeConfig/Json/RewritableConfigJson";

describe("ExpandRewrite", () => {

    it("should do simple substitution", () => {

    })
    it("should not allow overlapping keys", () => {
        const spec = <RewritableConfigJson<string>>{
            rewrite: {
                sourceString: ["xyz", "longer_xyz"],
                into: [["a", "b"], ["A, B"]],
            },
            renderings: "The value of xyz is longer_xyz"
        }
        const rewrite = new ExpandRewrite()
        expect(() => rewrite.convert(spec, "test")).to.throw
    })
})

describe("PrepareLayer", () => {

    it("should expand rewrites in map renderings", () => {
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
                            ["left", -6],
                           [ "right", +6],
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
    })
})

