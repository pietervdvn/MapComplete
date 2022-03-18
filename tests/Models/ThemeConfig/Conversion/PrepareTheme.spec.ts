import {describe} from 'mocha'
import {expect} from 'chai'
import {LayoutConfigJson} from "../../../../Models/ThemeConfig/Json/LayoutConfigJson";
import Constants from "../../../../Models/Constants";
import {LayerConfigJson} from "../../../../Models/ThemeConfig/Json/LayerConfigJson";
import {PrepareTheme} from "../../../../Models/ThemeConfig/Conversion/PrepareTheme";
import {TagRenderingConfigJson} from "../../../../Models/ThemeConfig/Json/TagRenderingConfigJson";
import LayoutConfig from "../../../../Models/ThemeConfig/LayoutConfig";
import assert from "assert";
import * as bookcaseLayer from "../../../../assets/generated/layers/public_bookcase.json"
import LayerConfig from "../../../../Models/ThemeConfig/LayerConfig";


const themeConfigJson: LayoutConfigJson = {
    
    description: "Descr",
    icon: "",
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

describe("PrepareTheme", () => {
    
    it("should apply overrideAll", () => {

        const sharedLayers = new Map<string, LayerConfigJson>()
        sharedLayers.set("public_bookcase", bookcaseLayer["default"])
        let themeConfigJsonPrepared = new PrepareTheme({
            tagRenderings: new Map<string, TagRenderingConfigJson>(),
            sharedLayers: sharedLayers
        }).convert( themeConfigJson, "test").result
        const themeConfig = new LayoutConfig(themeConfigJsonPrepared);
        const layerUnderTest = <LayerConfig> themeConfig.layers.find(l => l.id === "public_bookcase")
        expect(layerUnderTest.source.geojsonSource).eq("xyz")

    })
})
