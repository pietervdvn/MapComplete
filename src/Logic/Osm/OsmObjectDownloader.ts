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
        backend: string = "https://api.openstreetmap.org",
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

    async DownloadObjectAsync(id: string, maxCacheAgeInSecs?: number) {
        // Wait until uploading is done
        if (this._changes) {
            await this._changes.isUploading.AsPromise((o) => o === false)
        }

        const splitted = id.split("/")
        const type = splitted[0]
        const idN = Number(splitted[1])
        let obj: OsmObject | "deleted"
        if (idN < 0) {
            obj = this.constructObject(<"node" | "way" | "relation">type, idN)
        } else {
            obj = await OsmObjectDownloader.RawDownloadObjectAsync(type, idN, this.backend, maxCacheAgeInSecs)
        }
        if (obj === "deleted") {
            return obj
        }
        return await this.applyPendingChanges(obj)
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

    private applyNodeChange(object: OsmNode, change: { lat: number; lon: number }) {
        object.lat = change.lat
        object.lon = change.lon
    }

    private applyWayChange(object: OsmWay, change: { nodes: number[]; coordinates }) {
        object.nodes = change.nodes
        object.coordinates = change.coordinates.map(([lat, lon]) => [lon, lat])
    }

    private applyRelationChange(
        object: OsmRelation,
        change: { members: { type: "node" | "way" | "relation"; ref: number; role: string }[] }
    ) {
        object.members = change.members
    }

    private async applyPendingChanges(object: OsmObject): Promise<OsmObject | "deleted"> {
        if (!this._changes) {
            return object
        }
        const pendingChanges = this._changes.pendingChanges.data
        for (const pendingChange of pendingChanges) {
            if (object.id !== pendingChange.id || object.type !== pendingChange.type) {
                continue
            }
            if (pendingChange.doDelete) {
                return "deleted"
            }
            if (pendingChange.tags) {
                for (const { k, v } of pendingChange.tags) {
                    if (v === undefined) {
                        delete object.tags[k]
                    } else {
                        object.tags[k] = v
                    }
                }
            }

            if (pendingChange.changes) {
                switch (pendingChange.type) {
                    case "node":
                        this.applyNodeChange(<OsmNode>object, <any>pendingChange.changes)
                        break
                    case "way":
                        this.applyWayChange(<OsmWay>object, <any>pendingChange.changes)
                        break
                    case "relation":
                        this.applyRelationChange(<OsmRelation>object, <any>pendingChange.changes)
                        break
                }
            }
        }
        return object
    }

    /**
     * Creates an empty object of the specified type with the specified id.
     * We assume that the pending changes will be applied on them, filling in details such as coordinates, tags, ...
     */
    private constructObject(type: "node" | "way" | "relation", id: number): OsmObject {
        switch (type) {
            case "node":
                return new OsmNode(id)
            case "way":
                return new OsmWay(id)
            case "relation":
                return new OsmRelation(id)
        }
    }

    /**
     * Only to be used in exceptional cases
     * @param type
     * @param idN
     * @param backend
     * @param maxCacheAgeInSecs
     * @constructor
     */
    public static async RawDownloadObjectAsync(
        type: string,
        idN: number,
        backend: string,
        maxCacheAgeInSecs?: number
    ): Promise<OsmObject | "deleted"> {
        const full = type !== "node" ? "/full" : ""
        const url = `${backend}api/0.6/${type}/${idN}${full}`
        const rawData = await Utils.downloadJsonCachedAdvanced(
            url,
            (maxCacheAgeInSecs ?? 10) * 1000
        )
        if (rawData["error"] !== undefined && rawData["statuscode"] === 410) {
            return "deleted"
        }
        // A full query might contain more then just the requested object (e.g. nodes that are part of a way, where we only want the way)
        const parsed = OsmObject.ParseObjects(rawData["content"].elements)
        // Let us fetch the object we need
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
}
