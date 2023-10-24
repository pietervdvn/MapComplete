import { Utils } from "../../Utils"
import Constants from "../../Models/Constants"
import { LayerConfigJson } from "../../Models/ThemeConfig/Json/LayerConfigJson"
import { Store } from "../../Logic/UIEventSource"

export default class StudioServer {
    private readonly url: string
    private readonly _userId: Store<number>

    constructor(url: string, userId: Store<number>) {
        this.url = url
        this._userId = userId
    }

    public async fetchLayerOverview(): Promise<
        {
            id: string
            owner: number
        }[]
    > {
        const uid = this._userId.data
        let uidQueryParam = ""
        if (this._userId.data !== undefined) {
            uidQueryParam = "?userId=" + uid
        }
        const { allFiles } = <{ allFiles: string[] }>(
            await Utils.downloadJson(this.url + "/overview" + uidQueryParam)
        )
        const layerOverview: {
            id: string
            owner: number | undefined
        }[] = []
        for (let file of allFiles) {
            let owner = undefined
            if (file.startsWith("" + uid)) {
                owner = uid
                file = file.substring(file.indexOf("/") + 1)
            }
            if (!file.startsWith("layers/")) {
                continue
            }
            const id = file.substring(file.lastIndexOf("/") + 1, file.length - ".json".length)
            if (Constants.priviliged_layers.indexOf(<any>id) > 0) {
                continue
            }
            layerOverview.push({ id, owner })
        }
        return layerOverview
    }

    async fetchLayer(layerId: string): Promise<LayerConfigJson> {
        try {
            return await Utils.downloadJson(this.layerUrl(layerId))
        } catch (e) {
            return undefined
        }
    }

    async updateLayer(id: string, config: string) {
        if (id === undefined || id === "") {
            return
        }
        await fetch(this.layerUrl(id), {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: config,
        })
    }

    public layerUrl(id: string) {
        const uid = this._userId.data
        const uidStr = uid !== undefined ? "/" + uid : ""
        return `${this.url}${uidStr}/layers/${id}/${id}.json`
    }
}
