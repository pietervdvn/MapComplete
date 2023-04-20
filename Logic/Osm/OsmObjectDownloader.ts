import { Utils } from "../../Utils"
import { OsmNode, OsmObject, OsmRelation, OsmWay } from "./OsmObject"
import { NodeId, OsmId, RelationId, WayId } from "../../Models/OsmFeature"
import { Store, UIEventSource } from "../UIEventSource"
import { ChangeDescription } from "./Actions/ChangeDescription"

/**
 * The OSM-Object downloader downloads the latest version of the object, but applies 'pendingchanges' to them,
 * so that we always have a consistent view
 */
export default class OsmObjectDownloader {
    private readonly _changes?: {
        readonly pendingChanges: UIEventSource<ChangeDescription[]>
        readonly isUploading: Store<boolean>
    }
    private readonly backend: string
    private historyCache = new Map<string, UIEventSource<OsmObject[]>>()

    constructor(
        backend: string = "https://openstreetmap.org",
        changes?: {
            readonly pendingChanges: UIEventSource<ChangeDescription[]>
            readonly isUploading: Store<boolean>
        }
    ) {
        this._changes = changes
        if (!backend.endsWith("/")) {
            backend += "/"
        }
        if (!backend.startsWith("http")) {
            throw "Backend URL must begin with http"
        }
        this.backend = backend
    }

    async DownloadObjectAsync(id: NodeId, maxCacheAgeInSecs?: number): Promise<OsmNode | "deleted">
    async DownloadObjectAsync(id: WayId, maxCacheAgeInSecs?: number): Promise<OsmWay | "deleted">
    async DownloadObjectAsync(
        id: RelationId,
        maxCacheAgeInSecs?: number
    ): Promise<OsmRelation | undefined>
    async DownloadObjectAsync(id: OsmId, maxCacheAgeInSecs?: number): Promise<OsmObject | "deleted">
    async DownloadObjectAsync(
        id: string,
        maxCacheAgeInSecs?: number
    ): Promise<OsmObject | "deleted">
    async DownloadObjectAsync(
        id: string,
        maxCacheAgeInSecs?: number
    ): Promise<OsmObject | "deleted"> {
        const splitted = id.split("/")
        const type = splitted[0]
        const idN = Number(splitted[1])
        if (idN < 0) {
            throw "Invalid request: cannot download OsmObject " + id + ", it has a negative id"
        }

        const full = !id.startsWith("node") ? "/full" : ""
        const url = `${this.backend}api/0.6/${id}${full}`
        const rawData = await Utils.downloadJsonCachedAdvanced(
            url,
            (maxCacheAgeInSecs ?? 10) * 1000
        )
        if (rawData["error"] !== undefined && rawData["statuscode"] === 410) {
            return "deleted"
        }
        // A full query might contain more then just the requested object (e.g. nodes that are part of a way, where we only want the way)
        const parsed = OsmObject.ParseObjects(rawData["content"].elements)
        // Lets fetch the object we need
        for (const osmObject of parsed) {
            if (osmObject.type !== type) {
                continue
            }
            if (osmObject.id !== idN) {
                continue
            }
            // Found the one!
            return osmObject
        }
        throw "PANIC: requested object is not part of the response"
    }

    public DownloadHistory(id: NodeId): UIEventSource<OsmNode[]>

    public DownloadHistory(id: WayId): UIEventSource<OsmWay[]>

    public DownloadHistory(id: RelationId): UIEventSource<OsmRelation[]>

    public DownloadHistory(id: OsmId): UIEventSource<OsmObject[]>

    public DownloadHistory(id: string): UIEventSource<OsmObject[]> {
        if (this.historyCache.has(id)) {
            return this.historyCache.get(id)
        }
        const splitted = id.split("/")
        const type = splitted[0]
        const idN = Number(splitted[1])
        const src = new UIEventSource<OsmObject[]>([])
        this.historyCache.set(id, src)
        Utils.downloadJsonCached(
            `${this.backend}api/0.6/${type}/${idN}/history`,
            10 * 60 * 1000
        ).then((data) => {
            const elements: any[] = data.elements
            const osmObjects: OsmObject[] = []
            for (const element of elements) {
                let osmObject: OsmObject = null
                element.nodes = []
                switch (type) {
                    case "node":
                        osmObject = new OsmNode(idN, element)
                        break
                    case "way":
                        osmObject = new OsmWay(idN, element)
                        break
                    case "relation":
                        osmObject = new OsmRelation(idN, element)
                        break
                }
                osmObject?.SaveExtraData(element, [])
                osmObjects.push(osmObject)
            }
            src.setData(osmObjects)
        })
        return src
    }

    /**
     * Downloads the ways that are using this node.
     * Beware: their geometry will be incomplete!
     */
    public async DownloadReferencingWays(id: string): Promise<OsmWay[]> {
        const data = await Utils.downloadJsonCached(`${this.backend}api/0.6/${id}/ways`, 60 * 1000)
        return data.elements.map((wayInfo) => new OsmWay(wayInfo.id, wayInfo))
    }

    /**
     * Downloads the relations that are using this feature.
     * Beware: their geometry will be incomplete!
     */
    public async DownloadReferencingRelations(id: string): Promise<OsmRelation[]> {
        const data = await Utils.downloadJsonCached(
            `${this.backend}api/0.6/${id}/relations`,
            60 * 1000
        )
        return data.elements.map((wayInfo) => {
            const rel = new OsmRelation(wayInfo.id, wayInfo)
            rel.SaveExtraData(wayInfo, undefined)
            return rel
        })
    }
}
