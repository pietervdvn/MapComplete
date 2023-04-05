import { Utils } from "../../Utils"
import polygon_features from "../../assets/polygon-features.json"
import { Store, UIEventSource } from "../UIEventSource"
import { BBox } from "../BBox"
import OsmToGeoJson from "osmtogeojson"
import { NodeId, OsmFeature, OsmId, OsmTags, RelationId, WayId } from "../../Models/OsmFeature"
import { Feature, LineString, Polygon } from "geojson"

export abstract class OsmObject {
    private static defaultBackend = "https://www.openstreetmap.org/"
    protected static backendURL = OsmObject.defaultBackend
    private static polygonFeatures = OsmObject.constructPolygonFeatures()
    private static objectCache = new Map<string, UIEventSource<OsmObject>>()
    private static historyCache = new Map<string, UIEventSource<OsmObject[]>>()
    type: "node" | "way" | "relation"
    id: number
    /**
     * The OSM tags as simple object
     */
    tags: OsmTags & { id: OsmId }
    version: number
    public changed: boolean = false
    timestamp: Date

    protected constructor(type: string, id: number) {
        this.id = id
        // @ts-ignore
        this.type = type
        this.tags = {
            id: `${this.type}/${id}`,
        }
    }

    public static SetBackendUrl(url: string) {
        if (!url.endsWith("/")) {
            throw "Backend URL must end with a '/'"
        }
        if (!url.startsWith("http")) {
            throw "Backend URL must begin with http"
        }
        this.backendURL = url
    }

    public static DownloadObject(id: NodeId, forceRefresh?: boolean): Store<OsmNode>
    public static DownloadObject(id: RelationId, forceRefresh?: boolean): Store<OsmRelation>
    public static DownloadObject(id: WayId, forceRefresh?: boolean): Store<OsmWay>
    public static DownloadObject(id: string, forceRefresh: boolean = false): Store<OsmObject> {
        let src: UIEventSource<OsmObject>
        if (OsmObject.objectCache.has(id)) {
            src = OsmObject.objectCache.get(id)
            if (forceRefresh) {
                src.setData(undefined)
            } else {
                return src
            }
        } else {
            src = UIEventSource.FromPromise(OsmObject.DownloadObjectAsync(id))
        }

        OsmObject.objectCache.set(id, src)
        return src
    }

    static async DownloadPropertiesOf(id: string): Promise<OsmTags | "deleted"> {
        const splitted = id.split("/")
        const idN = Number(splitted[1])
        if (idN < 0) {
            return undefined
        }

        const url = `${OsmObject.backendURL}api/0.6/${id}`
        const rawData = await Utils.downloadJsonCachedAdvanced(url, 1000)
        if (rawData["error"] !== undefined && rawData["statuscode"] === 410) {
            return "deleted"
        }
        // Tags is undefined if the element does not have any tags
        return rawData["content"].elements[0].tags ?? {}
    }

    static async DownloadObjectAsync(
        id: NodeId,
        maxCacheAgeInSecs?: number
    ): Promise<OsmNode | undefined>
    static async DownloadObjectAsync(
        id: WayId,
        maxCacheAgeInSecs?: number
    ): Promise<OsmWay | undefined>
    static async DownloadObjectAsync(
        id: RelationId,
        maxCacheAgeInSecs?: number
    ): Promise<OsmRelation | undefined>
    static async DownloadObjectAsync(
        id: OsmId,
        maxCacheAgeInSecs?: number
    ): Promise<OsmObject | undefined>
    static async DownloadObjectAsync(
        id: string,
        maxCacheAgeInSecs?: number
    ): Promise<OsmObject | undefined>
    static async DownloadObjectAsync(
        id: string,
        maxCacheAgeInSecs?: number
    ): Promise<OsmObject | undefined> {
        const splitted = id.split("/")
        const type = splitted[0]
        const idN = Number(splitted[1])
        if (idN < 0) {
            return undefined
        }

        const full = !id.startsWith("node") ? "/full" : ""
        const url = `${OsmObject.backendURL}api/0.6/${id}${full}`
        const rawData = await Utils.downloadJsonCached(url, (maxCacheAgeInSecs ?? 10) * 1000)
        if (rawData === undefined) {
            return undefined
        }
        // A full query might contain more then just the requested object (e.g. nodes that are part of a way, where we only want the way)
        const parsed = OsmObject.ParseObjects(rawData.elements)
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

    /**
     * Downloads the ways that are using this node.
     * Beware: their geometry will be incomplete!
     */
    public static DownloadReferencingWays(id: string): Promise<OsmWay[]> {
        return Utils.downloadJsonCached(
            `${OsmObject.backendURL}api/0.6/${id}/ways`,
            60 * 1000
        ).then((data) => {
            return data.elements.map((wayInfo) => {
                const way = new OsmWay(wayInfo.id)
                way.LoadData(wayInfo)
                return way
            })
        })
    }

    /**
     * Downloads the relations that are using this feature.
     * Beware: their geometry will be incomplete!
     */
    public static async DownloadReferencingRelations(id: string): Promise<OsmRelation[]> {
        const data = await Utils.downloadJsonCached(
            `${OsmObject.backendURL}api/0.6/${id}/relations`,
            60 * 1000
        )
        return data.elements.map((wayInfo) => {
            const rel = new OsmRelation(wayInfo.id)
            rel.LoadData(wayInfo)
            rel.SaveExtraData(wayInfo, undefined)
            return rel
        })
    }

    public static DownloadHistory(id: string): UIEventSource<OsmObject[]> {
        if (OsmObject.historyCache.has(id)) {
            return OsmObject.historyCache.get(id)
        }
        const splitted = id.split("/")
        const type = splitted[0]
        const idN = Number(splitted[1])
        const src = new UIEventSource<OsmObject[]>([])
        OsmObject.historyCache.set(id, src)
        Utils.downloadJsonCached(
            `${OsmObject.backendURL}api/0.6/${type}/${idN}/history`,
            10 * 60 * 1000
        ).then((data) => {
            const elements: any[] = data.elements
            const osmObjects: OsmObject[] = []
            for (const element of elements) {
                let osmObject: OsmObject = null
                switch (type) {
                    case "node":
                        osmObject = new OsmNode(idN)
                        break
                    case "way":
                        osmObject = new OsmWay(idN)
                        break
                    case "relation":
                        osmObject = new OsmRelation(idN)
                        break
                }
                osmObject?.LoadData(element)
                osmObject?.SaveExtraData(element, [])
                osmObjects.push(osmObject)
            }
            src.setData(osmObjects)
        })
        return src
    }

    // bounds should be: [[maxlat, minlon], [minlat, maxlon]] (same as Utils.tile_bounds)
    public static async LoadArea(bbox: BBox): Promise<OsmObject[]> {
        const url = `${OsmObject.backendURL}api/0.6/map.json?bbox=${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`
        const data = await Utils.downloadJson(url)
        const elements: any[] = data.elements
        return OsmObject.ParseObjects(elements)
    }

    public static ParseObjects(elements: any[]): OsmObject[] {
        const objects: OsmObject[] = []
        const allNodes: Map<number, OsmNode> = new Map<number, OsmNode>()

        for (const element of elements) {
            const type = element.type
            const idN = element.id
            let osmObject: OsmObject = null
            switch (type) {
                case "node":
                    const node = new OsmNode(idN)
                    allNodes.set(idN, node)
                    osmObject = node
                    node.SaveExtraData(element)
                    break
                case "way":
                    osmObject = new OsmWay(idN)
                    const nodes = element.nodes.map((i) => allNodes.get(i))
                    osmObject.SaveExtraData(element, nodes)
                    break
                case "relation":
                    osmObject = new OsmRelation(idN)
                    const allGeojsons = OsmToGeoJson(
                        { elements },
                        // @ts-ignore
                        {
                            flatProperties: true,
                        }
                    )
                    const feature = allGeojsons.features.find(
                        (f) => f.id === osmObject.type + "/" + osmObject.id
                    )
                    osmObject.SaveExtraData(element, feature)
                    break
            }

            if (osmObject !== undefined && OsmObject.backendURL !== OsmObject.defaultBackend) {
                osmObject.tags["_backend"] = OsmObject.backendURL
            }

            osmObject?.LoadData(element)
            objects.push(osmObject)
        }
        return objects
    }

    /**
     * Uses the list of polygon features to determine if the given tags are a polygon or not.
     *
     * OsmObject.isPolygon({"building":"yes"}) // => true
     * OsmObject.isPolygon({"highway":"residential"}) // => false
     * */
    protected static isPolygon(tags: any): boolean {
        for (const tagsKey in tags) {
            if (!tags.hasOwnProperty(tagsKey)) {
                continue
            }
            const polyGuide: { values: Set<string>; blacklist: boolean } =
                OsmObject.polygonFeatures.get(tagsKey)
            if (polyGuide === undefined) {
                continue
            }
            if (polyGuide.values === null) {
                // .values is null, thus merely _having_ this key is enough to be a polygon (or if blacklist, being a line)
                return !polyGuide.blacklist
            }
            // is the key contained? Then we have a match if the value is contained
            const doesMatch = polyGuide.values.has(tags[tagsKey])
            if (polyGuide.blacklist) {
                return !doesMatch
            }
            return doesMatch
        }

        return false
    }

    private static constructPolygonFeatures(): Map<
        string,
        { values: Set<string>; blacklist: boolean }
    > {
        const result = new Map<string, { values: Set<string>; blacklist: boolean }>()
        for (const polygonFeature of polygon_features) {
            const key = polygonFeature.key

            if (polygonFeature.polygon === "all") {
                result.set(key, { values: null, blacklist: false })
                continue
            }

            const blacklist = polygonFeature.polygon === "blacklist"
            result.set(key, {
                values: new Set<string>(polygonFeature.values),
                blacklist: blacklist,
            })
        }

        return result
    }

    // The centerpoint of the feature, as [lat, lon]
    public abstract centerpoint(): [number, number]

    public abstract asGeoJson(): any

    abstract SaveExtraData(element: any, allElements: OsmObject[] | any)

    /**
     * Generates the changeset-XML for tags
     * @constructor
     */
    TagsXML(): string {
        let tags = ""
        for (const key in this.tags) {
            if (key.startsWith("_")) {
                continue
            }
            if (key === "id") {
                continue
            }
            const v = this.tags[key]
            if (v !== "" && v !== undefined) {
                tags +=
                    '        <tag k="' +
                    Utils.EncodeXmlValue(key) +
                    '" v="' +
                    Utils.EncodeXmlValue(this.tags[key]) +
                    '"/>\n'
            }
        }
        return tags
    }

    abstract ChangesetXML(changesetId: string): string

    protected VersionXML() {
        if (this.version === undefined) {
            return ""
        }
        return 'version="' + this.version + '"'
    }

    private LoadData(element: any): void {
        this.tags = element.tags ?? this.tags
        this.version = element.version
        this.timestamp = element.timestamp
        const tgs = this.tags
        if (element.tags === undefined) {
            // Simple node which is part of a way - not important
            return
        }
        tgs["_last_edit:contributor"] = element.user
        tgs["_last_edit:contributor:uid"] = element.uid
        tgs["_last_edit:changeset"] = element.changeset
        tgs["_last_edit:timestamp"] = element.timestamp
        tgs["_version_number"] = element.version
        tgs["id"] = <OsmId>(this.type + "/" + this.id)
    }
}

export class OsmNode extends OsmObject {
    lat: number
    lon: number

    constructor(id: number) {
        super("node", id)
    }

    ChangesetXML(changesetId: string): string {
        let tags = this.TagsXML()

        return (
            '    <node id="' +
            this.id +
            '" changeset="' +
            changesetId +
            '" ' +
            this.VersionXML() +
            ' lat="' +
            this.lat +
            '" lon="' +
            this.lon +
            '">\n' +
            tags +
            "    </node>\n"
        )
    }

    SaveExtraData(element) {
        this.lat = element.lat
        this.lon = element.lon
    }

    centerpoint(): [number, number] {
        return [this.lat, this.lon]
    }

    asGeoJson(): OsmFeature {
        return {
            type: "Feature",
            properties: this.tags,
            geometry: {
                type: "Point",
                coordinates: [this.lon, this.lat],
            },
        }
    }
}

export class OsmWay extends OsmObject {
    nodes: number[] = []
    // The coordinates of the way, [lat, lon][]
    coordinates: [number, number][] = []
    lat: number
    lon: number

    constructor(id: number) {
        super("way", id)
    }

    centerpoint(): [number, number] {
        return [this.lat, this.lon]
    }

    ChangesetXML(changesetId: string): string {
        let tags = this.TagsXML()
        let nds = ""
        for (const node in this.nodes) {
            nds += '      <nd ref="' + this.nodes[node] + '"/>\n'
        }

        return (
            '    <way id="' +
            this.id +
            '" changeset="' +
            changesetId +
            '" ' +
            this.VersionXML() +
            ">\n" +
            nds +
            tags +
            "    </way>\n"
        )
    }

    SaveExtraData(element, allNodes: OsmNode[]) {
        let latSum = 0
        let lonSum = 0

        const nodeDict = new Map<number, OsmNode>()
        for (const node of allNodes) {
            nodeDict.set(node.id, node)
        }

        if (element.nodes === undefined) {
            console.error("PANIC: no nodes!")
        }

        for (const nodeId of element.nodes) {
            const node = nodeDict.get(nodeId)
            if (node === undefined) {
                console.error("Error: node ", nodeId, "not found in ", nodeDict)
                // This is probably part of a relation which hasn't been fully downloaded
                continue
            }
            this.coordinates.push(node.centerpoint())
            latSum += node.lat
            lonSum += node.lon
        }
        let count = this.coordinates.length
        this.lat = latSum / count
        this.lon = lonSum / count
        this.nodes = element.nodes
    }

    public asGeoJson(): Feature<Polygon | LineString> & { properties: { id: WayId } } {
        let coordinates: [number, number][] | [number, number][][] = this.coordinates.map(
            ([lat, lon]) => [lon, lat]
        )
        let geometry: LineString | Polygon

        if (this.isPolygon()) {
            geometry = {
                type: "Polygon",
                coordinates: [coordinates],
            }
        } else {
            geometry = {
                type: "LineString",
                coordinates: coordinates,
            }
        }
        return {
            type: "Feature",
            properties: <any>this.tags,
            geometry,
        }
    }

    private isPolygon(): boolean {
        // Compare lat and lon seperately, as the coordinate array might not be a reference to the same object
        if (
            this.coordinates[0][0] !== this.coordinates[this.coordinates.length - 1][0] ||
            this.coordinates[0][1] !== this.coordinates[this.coordinates.length - 1][1]
        ) {
            return false // Not closed
        }
        return OsmObject.isPolygon(this.tags)
    }
}

export class OsmRelation extends OsmObject {
    public members: {
        type: "node" | "way" | "relation"
        ref: number
        role: string
    }[]

    private geojson = undefined

    constructor(id: number) {
        super("relation", id)
    }

    centerpoint(): [number, number] {
        return [0, 0] // TODO
    }

    ChangesetXML(changesetId: string): string {
        let members = ""
        for (const member of this.members) {
            members +=
                '      <member type="' +
                member.type +
                '" ref="' +
                member.ref +
                '" role="' +
                member.role +
                '"/>\n'
        }

        let tags = this.TagsXML()
        let cs = ""
        if (changesetId !== undefined) {
            cs = `changeset="${changesetId}"`
        }
        return `    <relation id="${this.id}" ${cs} ${this.VersionXML()}>
${members}${tags}        </relation>
`
    }

    SaveExtraData(element, geojson) {
        this.members = element.members
        this.geojson = geojson
    }

    asGeoJson(): any {
        if (this.geojson !== undefined) {
            return this.geojson
        }
        throw "Not Implemented"
    }
}
