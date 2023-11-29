import Script from "./Script"
import { LayerConfigJson } from "../src/Models/ThemeConfig/Json/LayerConfigJson"
import { readFileSync, writeFileSync } from "fs"
import { AllSharedLayers } from "../src/Customizations/AllSharedLayers"

class PrepareFavouritesLayerJson extends Script {
    constructor() {
        super("Prepares the 'favourites'-layer")
    }

    async main(args: string[]): Promise<void> {
        const allConfigs = AllSharedLayers.getSharedLayersConfigs()
        const proto = this.readLayer("favourite/favourite.proto.json")
        const questions = allConfigs.get("questions")
        proto.tagRenderings.push(...questions.tagRenderings)

        writeFileSync("./assets/layers/favourite/favourite.json", JSON.stringify(proto, null, "  "))
    }

    private readLayer(path: string): LayerConfigJson {
        return JSON.parse(readFileSync("./assets/layers/" + path, "utf8"))
    }
}

new PrepareFavouritesLayerJson().run()
