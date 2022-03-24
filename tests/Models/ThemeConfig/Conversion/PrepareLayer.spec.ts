import {describe} from 'mocha'
import {expect} from 'chai'
import {LayoutConfigJson} from "../../../../Models/ThemeConfig/Json/LayoutConfigJson";
import {LayerConfigJson} from "../../../../Models/ThemeConfig/Json/LayerConfigJson";
import {PrepareTheme} from "../../../../Models/ThemeConfig/Conversion/PrepareTheme";
import {TagRenderingConfigJson} from "../../../../Models/ThemeConfig/Json/TagRenderingConfigJson";
import LayoutConfig from "../../../../Models/ThemeConfig/LayoutConfig";
import * as bookcaseLayer from "../../../../assets/generated/layers/public_bookcase.json"
import LayerConfig from "../../../../Models/ThemeConfig/LayerConfig";
import {ExtractImages} from "../../../../Models/ThemeConfig/Conversion/FixImages";
import * as cyclofix from "../../../../assets/generated/themes/cyclofix.json"
import LineRenderingConfigJson from "../../../../Models/ThemeConfig/Json/LineRenderingConfigJson";
import {PrepareLayer} from "../../../../Models/ThemeConfig/Conversion/PrepareLayer";



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
    )
})

