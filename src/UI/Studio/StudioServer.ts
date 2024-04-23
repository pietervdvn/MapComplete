import { Utils } from "../../Utils"
import Constants from "../../Models/Constants"
import { LayerConfigJson } from "../../Models/ThemeConfig/Json/LayerConfigJson"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { LayoutConfigJson } from "../../Models/ThemeConfig/Json/LayoutConfigJson"

/**
 * A small class wrapping around the Server API.
 * This is _not_ the script which actually hosts!
 */
export default class StudioServer {
    private readonly url: string
    private readonly _userId: Store<number>
    private readonly overview: UIEventSource<{
        success: { id: string; owner: number; category: "layers" | "themes" }[]
    } | { error: any } | undefined>

    constructor(url: string, userId: Store<number>) {
        this.url = url
        this._userId = userId
        this.overview = UIEventSource.FromPromiseWithErr(this.fetchOverviewRaw())
    }

    public fetchOverview(): Store<{
        success: { id: string; owner: number; category: "layers" | "themes" }[]
    } | { error } | undefined> {
        return this.overview
    }

    private async fetchOverviewRaw(): Promise<
        {
            id: string
            owner: number
            category: "layers" | "themes"
        }[]
    > {
        const { allFiles } = <{ allFiles: string[] }>(
            await Utils.downloadJson(this.url + "/overview")
        )
        const layerOverview: {
            id: string
            owner: number | undefined
            category: "layers" | "themes"
        }[] = []
        for (let file of allFiles) {
            const parts = file.split("/")
            let owner = Number(parts[0])
            if (!isNaN(owner)) {
                parts.splice(0, 1)
                file = file.substring(file.indexOf("/") + 1)
            } else {
                owner = undefined
            }
            const category = <"layers" | "themes">parts[0]
            const id = file.substring(file.lastIndexOf("/") + 1, file.length - ".json".length)
            if (Constants.priviliged_layers.indexOf(<any>id) > 0) {
                continue
            }
            layerOverview.push({ id, owner, category })
        }
        return layerOverview
    }

    async fetch(layerId: string, category: "layers", uid?: number): Promise<LayerConfigJson>
    async fetch(layerId: string, category: "themes", uid?: number): Promise<LayoutConfigJson>
    async fetch(
        layerId: string,
        category: "layers" | "themes",
        uid?: number
    ): Promise<LayerConfigJson | LayoutConfigJson> {
        try {
            return <any>await Utils.downloadJson(this.urlFor(layerId, category, uid))
        } catch (e) {
            return undefined
        }
    }

    async delete(id: string, category: "layers" | "themes") {
        if (id === undefined || id === "") {
            return
        }
        await fetch(this.urlFor(id, category), {
            method: "DELETE"
        })
        const overview: { id: string; owner: number; category: "layers" | "themes" }[] = this.overview.data?.["success"]
        if (overview) {
            const index = overview.findIndex(obj => obj.id === id && obj.category === category && obj.owner === this._userId.data)
            if (index >= 0) {
                overview.splice(index, 1)
                this.overview.ping()
            }
        }
    }

    async update(id: string, config: string, category: "layers" | "themes") {
        if (id === undefined || id === "") {
            return
        }
        await fetch(this.urlFor(id, category), {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: config
        })
    }

    public layerUrl(id: string) {
        return this.urlFor(id, "layers")
    }

    public urlFor(id: string, category: "layers" | "themes", uid?: number) {
        uid ??= this._userId.data
        const uidStr = uid !== undefined ? "/" + uid : ""
        return `${this.url}${uidStr}/${category}/${id}/${id}.json`
    }
}
