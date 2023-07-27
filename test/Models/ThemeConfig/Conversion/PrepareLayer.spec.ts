import { LayerConfigJson } from "../../../../src/Models/ThemeConfig/Json/LayerConfigJson"
import { TagRenderingConfigJson } from "../../../../src/Models/ThemeConfig/Json/TagRenderingConfigJson"
import LineRenderingConfigJson from "../../../../src/Models/ThemeConfig/Json/LineRenderingConfigJson"
import {
    ExpandRewrite,
    PrepareLayer,
    RewriteSpecial,
} from "../../../../src/Models/ThemeConfig/Conversion/PrepareLayer"
import { QuestionableTagRenderingConfigJson } from "../../../../src/Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"
import RewritableConfigJson from "../../../../src/Models/ThemeConfig/Json/RewritableConfigJson"
import { describe, expect, it } from "vitest"

describe("ExpandRewrite", () => {
    it("should not allow overlapping keys", () => {
        const spec = <RewritableConfigJson<string>>{
            rewrite: {
                sourceString: ["xyz", "longer_xyz"],
                into: [["a", "b"], ["A, B"]],
            },
            renderings: "The value of xyz is longer_xyz",
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
                osmTags: "key=value",
            },
            mapRendering: [
                {
                    rewrite: {
                        sourceString: ["left|right", "lr_offset"],
                        into: [
                            ["left", -6],
                            ["right", +6],
                        ],
                    },
                    renderings: <LineRenderingConfigJson>{
                        color: {
                            render: "#888",
                            mappings: [
                                {
                                    if: "parking:condition:left|right=free",
                                    then: "#299921",
                                },
                                {
                                    if: "parking:condition:left|right=disc",
                                    then: "#219991",
                                },
                            ],
                        },
                        offset: "lr_offset",
                    },
                },
            ],
        }
        const prep = new PrepareLayer({
            tagRenderings: new Map<string, TagRenderingConfigJson>(),
            sharedLayers: new Map<string, LayerConfigJson>(),
        })
        const result = prep.convertStrict(exampleLayer, "test")

        const expected = {
            id: "testlayer",
            source: { osmTags: "key=value" },
            mapRendering: [
                {
                    color: {
                        render: "#888",
                        mappings: [
                            {
                                if: "parking:condition:left=free",
                                then: "#299921",
                            },
                            {
                                if: "parking:condition:left=disc",
                                then: "#219991",
                            },
                        ],
                    },
                    offset: -6,
                },
                {
                    color: {
                        render: "#888",
                        mappings: [
                            {
                                if: "parking:condition:right=free",
                                then: "#299921",
                            },
                            {
                                if: "parking:condition:right=disc",
                                then: "#219991",
                            },
                        ],
                    },
                    offset: 6,
                },
            ],
            titleIcons: [{ render: "icons.defaults", id: "iconsdefaults" }],
        }

        expect(result).toEqual(expected)
    })
})

describe("RewriteSpecial", function () {
    it("should rewrite the UK import button", () => {
        const tr = <QuestionableTagRenderingConfigJson>{
            id: "uk_addresses_import_button",
            render: {
                special: {
                    type: "import_button",
                    targetLayer: "address",
                    tags: "urpn_count=$urpn_count;ref:GB:uprn=$ref:GB:uprn$",
                    text: "Add this address",
                    icon: "./assets/themes/uk_addresses/housenumber_add.svg",
                },
            },
        }
        const r = new RewriteSpecial().convert(tr, "test").result
        expect(r).toEqual({
            id: "uk_addresses_import_button",
            render: {
                "*": "{import_button(address,urpn_count=$urpn_count;ref:GB:uprn=$ref:GB:uprn$,Add this address,./assets/themes/uk_addresses/housenumber_add.svg,,,,)}",
            },
        })
    })
})
