import {describe} from 'mocha'
import {expect} from 'chai'
import {Utils} from "../../../../Utils";
import {DesugaringContext} from "../../../../Models/ThemeConfig/Conversion/Conversion";
import {LayerConfigJson} from "../../../../Models/ThemeConfig/Json/LayerConfigJson";
import {TagRenderingConfigJson} from "../../../../Models/ThemeConfig/Json/TagRenderingConfigJson";
import {PrepareLayer} from "../../../../Models/ThemeConfig/Conversion/PrepareLayer";
import * as bookcases from "../../../../assets/layers/public_bookcase/public_bookcase.json";
import CreateNoteImportLayer from "../../../../Models/ThemeConfig/Conversion/CreateNoteImportLayer";

describe("CreateNoteImportLayer", () => {
    
        it("should generate a layerconfig", () => {
            const desugaringState: DesugaringContext = {
                sharedLayers: new Map<string, LayerConfigJson>(),
                tagRenderings: new Map<string, TagRenderingConfigJson>()

            }
            const layerPrepare = new PrepareLayer(desugaringState)
            const layer = layerPrepare.convertStrict(bookcases, "ImportLayerGeneratorTest:Parse bookcases")
            const generator = new CreateNoteImportLayer()
            const generatedLayer: LayerConfigJson = generator.convertStrict(layer, "ImportLayerGeneratorTest: convert")
            expect(generatedLayer.isShown.mappings[1].if["and"][1].or[0].and[0]).deep.equal("_tags~(^|.*;)amenity=public_bookcase($|;.*)")
            expect(generatedLayer.minzoom <= layer.minzoom, "Zoomlevel is to high").true
            let renderings = Utils.NoNull(Utils.NoNull(generatedLayer.tagRenderings
                .map(tr => (<TagRenderingConfigJson>tr).render))
                .map(render => render["en"]))
            expect(renderings.some(r => r.indexOf("import_button") > 0), "no import button found").true
            
            
        })
})
