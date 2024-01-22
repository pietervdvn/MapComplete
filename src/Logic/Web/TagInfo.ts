import { Utils } from "../../Utils"

export interface TagInfoStats {
    /**
     * The total number of entries in the data array, **not** the total number of objects known in OSM!
     *
     * Use `data.find(item => item.type==="all").count` for this
     */
    total: number
    data: {
        type: "all" | "nodes" | "ways" | "relations"
        count: number
        count_fraction: number
    }[]
}

export default class TagInfo {
    public static readonly global = new TagInfo()
    private readonly _backend: string

    constructor(backend = "https://taginfo.openstreetmap.org/") {
        this._backend = backend
    }

    public getStats(key: string, value?: string): Promise<TagInfoStats> {
        let url: string
        if (value) {
            url = `${this._backend}api/4/tag/stats?key=${key}&value=${value}`
        } else {
            url = `${this._backend}api/4/key/stats?key=${key}`
        }
        return Utils.downloadJsonCached(url, 1000 * 60 * 60)
    }

    /**
     * Creates the URL to the webpage containing more information
     * @param k
     * @param v
     */
    webUrl(k: string, v: string) {
        if (v) {
            return `${this._backend}/tags/${k}=${v}#overview`
        } else {
            return `${this._backend}/keys/${k}#overview`
        }
    }
}
