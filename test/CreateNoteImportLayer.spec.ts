import T from "./TestHelper";
import CreateNoteImportLayer from "../Models/ThemeConfig/Conversion/CreateNoteImportLayer";
import * as bookcases from "../assets/layers/public_bookcase/public_bookcase.json"
import {DesugaringContext, PrepareLayer} from "../Models/ThemeConfig/Conversion/LegacyJsonConvert";
import {LayerConfigJson} from "../Models/ThemeConfig/Json/LayerConfigJson";
import {TagRenderingConfigJson} from "../Models/ThemeConfig/Json/TagRenderingConfigJson";
import LayerConfig from "../Models/ThemeConfig/LayerConfig";
import * as fs from "fs";

export default class CreateNoteImportLayerSpec extends T {

    constructor() {
        super([
            ["Bookcase", () => {
                const desugaringState: DesugaringContext = {
                    sharedLayers: new Map<string, LayerConfigJson>(),
                    tagRenderings: new Map<string, TagRenderingConfigJson>()

                }
                const layerPrepare = new PrepareLayer()
                const layer = new LayerConfig(layerPrepare.convertStrict(desugaringState, bookcases, "ImportLayerGeneratorTest:Parse bookcases"), "ImportLayerGeneratorTest: init bookcases-layer")
                const generator = new CreateNoteImportLayer()
                const generatedLayer = generator.convertStrict(desugaringState, layer, "ImportLayerGeneratorTest: convert")
                fs.writeFileSync("bookcases-import-layer.generated.json", JSON.stringify(generatedLayer, null, "  "), "utf8")
console.log(JSON.stringify(generatedLayer, null, "  "))
            }]
        ]);
    }


}