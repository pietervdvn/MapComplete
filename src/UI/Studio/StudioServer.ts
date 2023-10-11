import { Utils } from "../../Utils"
import Constants from "../../Models/Constants"
import { LayerConfigJson } from "../../Models/ThemeConfig/Json/LayerConfigJson"

export default class StudioServer {
    private _url: string

    constructor(url: string) {
        this._url = url
    }

    public async fetchLayerOverview(): Promise<Set<string>> {
        const { allFiles } = <{ allFiles: string[] }>(
            await Utils.downloadJson(this._url + "/overview")
        )
        const layers = allFiles
            .filter((f) => f.startsWith("layers/"))
            .map((l) => l.substring(l.lastIndexOf("/") + 1, l.length - ".json".length))
            .filter((layerId) => Constants.priviliged_layers.indexOf(<any>layerId) < 0)
        return new Set<string>(layers)
    }

    async fetchLayer(layerId: string, checkNew: boolean = false): Promise<LayerConfigJson> {
        try {
            return await Utils.downloadJson(
                this._url +
                    "/layers/" +
                    layerId +
                    "/" +
                    layerId +
                    ".json" +
                    (checkNew ? ".new.json" : "")
            )
        } catch (e) {
            return undefined
        }
    }
}
