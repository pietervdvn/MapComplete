import T from "./TestHelper";
import * as assert from "assert";
import {LayoutConfigJson} from "../Models/ThemeConfig/Json/LayoutConfigJson";
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig";
import * as bookcaseLayer from "../assets/generated/layers/public_bookcase.json"
import {PrepareTheme} from "../Models/ThemeConfig/Conversion/LegacyJsonConvert";
import {TagRenderingConfigJson} from "../Models/ThemeConfig/Json/TagRenderingConfigJson";
import {LayerConfigJson} from "../Models/ThemeConfig/Json/LayerConfigJson";
import Constants from "../Models/Constants";

export default class ThemeSpec extends T {
    constructor() {
        super(            [
                ["Nested overrides work", () => {

                    let themeConfigJson: LayoutConfigJson = {
                        description: "Descr",
                        icon: "",
                        language: ["en"],
                        layers: [
                            {
                                builtin: "public_bookcase",
                                override: {
                                    source: {
                                        geoJson: "xyz"
                                    }
                                }
                            }
                        ],
                        maintainer: "",
                        startLat: 0,
                        startLon: 0,
                        startZoom: 0,
                        title: {
                            en: "Title"
                        },
                        version: "",
                        id: "test"
                    }
                    // TOtal cheat: disable the default layers:
                    Constants.added_by_default.splice(0, Constants.added_by_default.length)
                    const sharedLayers = new Map<string, LayerConfigJson>()
                    sharedLayers.set("public_bookcase", bookcaseLayer["default"])
                    themeConfigJson = new PrepareTheme().convertStrict({
                        tagRenderings: new Map<string, TagRenderingConfigJson>(),
                        sharedLayers: sharedLayers
                    }, themeConfigJson, "test")
                    const themeConfig = new LayoutConfig(themeConfigJson);
                    assert.equal("xyz", themeConfig.layers[0].source.geojsonSource)


                }]
            ]);
    }
}
