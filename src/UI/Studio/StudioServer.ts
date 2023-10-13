import { Utils } from "../../Utils"
import Constants from "../../Models/Constants"
import { LayerConfigJson } from "../../Models/ThemeConfig/Json/LayerConfigJson"

export default class StudioServer {
    private readonly url: string

    constructor(url: string) {
        this.url = url
    }

    public async fetchLayerOverview(): Promise<Set<string>> {
        const { allFiles } = <{ allFiles: string[] }>(
            await Utils.downloadJson(this.url + "/overview")
        )
        const layers = allFiles
            .filter((f) => f.startsWith("layers/"))
            .map((l) => l.substring(l.lastIndexOf("/") + 1, l.length - ".json".length))
            .filter((layerId) => Constants.priviliged_layers.indexOf(<any>layerId) < 0)
        return new Set<string>(layers)
    }

    async fetchLayer(layerId: string): Promise<LayerConfigJson> {
        try {
            return await Utils.downloadJson(
                this.url + "/layers/" + layerId + "/" + layerId + ".json"
            )
        } catch (e) {
            return undefined
        }
    }

    async updateLayer(config: LayerConfigJson) {
        const id = config.id
        if (id === undefined || id === "") {
            return
        }
        await fetch(`${this.url}/layers/${id}/${id}.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify(config, null, "  "),
        })
    }
}
