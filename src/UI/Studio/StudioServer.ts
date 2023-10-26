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

    public async fetchOverview(): Promise<
        {
            id: string
            owner: number
            category: "layers" | "themes"
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
            category: "layers" | "themes"
        }[] = []
        for (let file of allFiles) {
            let owner = undefined
            if (file.startsWith("" + uid)) {
                owner = uid
                file = file.substring(file.indexOf("/") + 1)
            }
            const category = <"layers" | "themes">file.substring(0, file.indexOf("/"))
            const id = file.substring(file.lastIndexOf("/") + 1, file.length - ".json".length)
            if (Constants.priviliged_layers.indexOf(<any>id) > 0) {
                continue
            }
            layerOverview.push({ id, owner, category })
        }
        return layerOverview
    }

    async fetch(layerId: string, category: "layers" | "themes"): Promise<LayerConfigJson> {
        try {
            return await Utils.downloadJson(this.urlFor(layerId, category))
        } catch (e) {
            return undefined
        }
    }

    async update(id: string, config: string, category: "layers" | "themes") {
        if (id === undefined || id === "") {
            return
        }
        await fetch(this.urlFor(id, category), {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: config,
        })
    }

    public layerUrl(id: string) {
        return this.urlFor(id, "layers")
    }

    public urlFor(id: string, category: "layers" | "themes") {
        const uid = this._userId.data
        const uidStr = uid !== undefined ? "/" + uid : ""
        return `${this.url}${uidStr}/${category}/${id}/${id}.json`
    }
}
