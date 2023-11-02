import { Utils } from "../../../../src/Utils"
import { DesugaringContext } from "../../../../src/Models/ThemeConfig/Conversion/Conversion"
import { LayerConfigJson } from "../../../../src/Models/ThemeConfig/Json/LayerConfigJson"
import { TagRenderingConfigJson } from "../../../../src/Models/ThemeConfig/Json/TagRenderingConfigJson"
import { PrepareLayer } from "../../../../src/Models/ThemeConfig/Conversion/PrepareLayer"
import * as bookcases from "../../../../assets/layers/public_bookcase/public_bookcase.json"
import CreateNoteImportLayer from "../../../../src/Models/ThemeConfig/Conversion/CreateNoteImportLayer"
import { describe, expect, it } from "vitest"
import { QuestionableTagRenderingConfigJson } from "../../../../src/Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"
import { ConversionContext } from "../../../../src/Models/ThemeConfig/Conversion/ConversionContext"

describe("CreateNoteImportLayer", () => {
    it("should generate a layerconfig", () => {
        const desugaringState: DesugaringContext = {
            sharedLayers: new Map<string, LayerConfigJson>(),
            tagRenderings: new Map<string, QuestionableTagRenderingConfigJson>(),
        }
        const layerPrepare = new PrepareLayer(desugaringState)
        const layer = layerPrepare.convertStrict(
            bookcases,
            ConversionContext.test("parse bookcases")
        )
        const generator = new CreateNoteImportLayer()
        const generatedLayer: LayerConfigJson = generator.convertStrict(
            layer,
            ConversionContext.test("convert")
        )
        expect(generatedLayer.isShown["and"][1].or[0].and[0]).toEqual(
            "_tags~(^|.*;)amenity=public_bookcase($|;.*)"
        )
        // "Zoomlevel is to high"
        expect(generatedLayer.minzoom <= layer.minzoom).toBe(true)
        let renderings = Utils.NoNull(
            Utils.NoNull(
                generatedLayer.tagRenderings.map((tr) => (<TagRenderingConfigJson>tr).render)
            ).map((render) => render["en"])
        )
        // "no import button found"
        expect(renderings.some((r) => r.indexOf("import_button") > 0)).toBe(true)
    })
})
