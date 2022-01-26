import T from "./TestHelper";
import CreateNoteImportLayer from "../Models/ThemeConfig/Conversion/CreateNoteImportLayer";
import * as bookcases from "../assets/layers/public_bookcase/public_bookcase.json"
import {DesugaringContext} from "../Models/ThemeConfig/Conversion/Conversion";
import {LayerConfigJson} from "../Models/ThemeConfig/Json/LayerConfigJson";
import {TagRenderingConfigJson} from "../Models/ThemeConfig/Json/TagRenderingConfigJson";
import {PrepareLayer} from "../Models/ThemeConfig/Conversion/PrepareLayer";
import {Utils} from "../Utils";

export default class CreateNoteImportLayerSpec extends T {

    constructor() {
        super([
            ["Bookcase", () => {
                const desugaringState: DesugaringContext = {
                    sharedLayers: new Map<string, LayerConfigJson>(),
                    tagRenderings: new Map<string, TagRenderingConfigJson>()

                }
                const layerPrepare = new PrepareLayer()
                const layer = layerPrepare.convertStrict(desugaringState, bookcases, "ImportLayerGeneratorTest:Parse bookcases")
                const generator = new CreateNoteImportLayer()
                const generatedLayer: LayerConfigJson = generator.convertStrict(desugaringState, layer, "ImportLayerGeneratorTest: convert")
                T.equals("_tags~(^|.*;)amenity=public_bookcase($|;.*)", generatedLayer.isShown.mappings[1].if["and"][1].or[0].and[0])
                T.isTrue(generatedLayer.minzoom <= layer.minzoom, "Zoomlevel is to high")
                let renderings = Utils.NoNull(Utils.NoNull(generatedLayer.tagRenderings
                    .map(tr => (<TagRenderingConfigJson>tr).render))
                    .map(render => render["en"]))
                T.isTrue(renderings.some(r => r.indexOf("import_button") > 0), "no import button found")
            }]
        ]);
    }


}