import T from "./TestHelper";
import CreateNoteImportLayer from "../Models/ThemeConfig/Conversion/CreateNoteImportLayer";
import * as bookcases from "../assets/layers/public_bookcase/public_bookcase.json"
import {DesugaringContext} from "../Models/ThemeConfig/Conversion/Conversion";
import {LayerConfigJson} from "../Models/ThemeConfig/Json/LayerConfigJson";
import {TagRenderingConfigJson} from "../Models/ThemeConfig/Json/TagRenderingConfigJson";
import LayerConfig from "../Models/ThemeConfig/LayerConfig";
import {PrepareLayer} from "../Models/ThemeConfig/Conversion/PrepareLayer";

export default class CreateNoteImportLayerSpec extends T {

    constructor() {
        super([
            ["Bookcase", () => {
                const desugaringState: DesugaringContext = {
                    sharedLayers: new Map<string, LayerConfigJson>(),
                    tagRenderings: new Map<string, TagRenderingConfigJson>()

                }
                const layerPrepare = new PrepareLayer()
                const layer =layerPrepare.convertStrict(desugaringState, bookcases, "ImportLayerGeneratorTest:Parse bookcases")
                const generator = new CreateNoteImportLayer()
                const generatedLayer = generator.convertStrict(desugaringState, layer, "ImportLayerGeneratorTest: convert")
       //         fs.writeFileSync("bookcases-import-layer.generated.json", JSON.stringify(generatedLayer, null, "  "), "utf8")
console.log(JSON.stringify(generatedLayer, null, "  "))
            }]
        ]);
    }


}