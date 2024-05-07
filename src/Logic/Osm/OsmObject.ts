import { Utils } from "../../Utils"
import polygon_features from "../../assets/polygon-features.json"
import { OsmFeature, OsmId, OsmTags, WayId } from "../../Models/OsmFeature"
import OsmToGeoJson from "osmtogeojson"
import { Feature, LineString, Polygon } from "geojson"

export abstract class OsmObject {
    private static defaultBackend = "https://api.openstreetmap.org/"
    protected static backendURL = OsmObject.defaultBackend
    public static polygonFeatures = OsmObject.constructPolygonFeatures()
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

    /** The centerpoint of the feature, as [lat, lon]
     *
     */
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
    abstract ChangesetXML(changesetId: string, header?: string): string

    protected VersionXML() {
        if (this.version === undefined) {
            return ""
        }
        return 'version="' + this.version + '"'
    }

    protected LoadData(element: any): void {
        if (element === undefined) {
            return
        }
        this.tags = element?.tags ?? this.tags
        const tgs = this.tags
        tgs["id"] = <OsmId>(this.type + "/" + this.id)
        this.version = element?.version
        this.timestamp = element?.timestamp
        if (element?.tags === undefined) {
            // Simple node which is part of a way - not important
            return
        }
        tgs["_last_edit:contributor"] = element.user
        tgs["_last_edit:contributor:uid"] = element.uid
        tgs["_last_edit:changeset"] = element.changeset
        tgs["_last_edit:timestamp"] = element.timestamp
        tgs["_version_number"] = element.version
    }
}

export class OsmNode extends OsmObject {
    lat: number
    lon: number

    constructor(id: number, extraData?) {
        super("node", id)
        this.LoadData(extraData)
    }

    /**
     *
     * const obj = new OsmNode(1234)
     * obj.tags.key = "value"
     * obj.lat = 1
     * obj.lon = 2
     * obj.ChangesetXML("123").trim() // => '<node id="1234"   changeset="123"  lat="1" lon="2">\n        <tag k="key" v="value"/>\n    </node>'
     *
     * @param changesetId
     * @param header
     * @constructor
     */
    ChangesetXML(changesetId: string, header?: string): string {
        let tags = this.TagsXML()
        return `    <node id="${this.id}" ${header ?? ""} ${
            changesetId ? ' changeset="' + changesetId + '" ' : ""
        }${this.VersionXML()} lat="${this.lat}" lon="${this.lon}">
${tags}    </node>
`
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

    constructor(id: number, wayInfo?) {
        super("way", id)
        this.LoadData(wayInfo)
    }

    centerpoint(): [number, number] {
        return [this.lat, this.lon]
    }

    /**
     * const obj = new OsmWay(1234)
     * obj.tags.key = "value"
     * obj.ChangesetXML("123").trim() // => '<way id="1234"  changeset="123"  >\n        <tag k="key" v="value"/>\n    </way>'
     */
    ChangesetXML(changesetId: string, header?: string): string {
        let tags = this.TagsXML()
        let nds = ""
        for (const node in this.nodes) {
            nds += '      <nd ref="' + this.nodes[node] + '"/>\n'
        }

        return `    <way id="${this.id}" ${header ?? ""} ${
            changesetId ? 'changeset="' + changesetId + '" ' : ""
        } ${this.VersionXML()}>
${nds}${tags}    </way>
`
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

    constructor(id: number, extraInfo?: any) {
        super("relation", id)
        this.LoadData(extraInfo)
    }

    centerpoint(): [number, number] {
        return [0, 0] // TODO
    }

    ChangesetXML(changesetId: string, header?: string): string {
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
        return `    <relation id="${this.id}" ${header ?? ""} ${cs} ${this.VersionXML()}>
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
