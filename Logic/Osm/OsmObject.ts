import {Utils} from "../../Utils";
import * as polygon_features from "../../assets/polygon-features.json";
import {UIEventSource} from "../UIEventSource";
import {BBox} from "../BBox";


export abstract class OsmObject {

    private static defaultBackend = "https://www.openstreetmap.org/"
    protected static backendURL = OsmObject.defaultBackend;
    private static polygonFeatures = OsmObject.constructPolygonFeatures()
    private static objectCache = new Map<string, UIEventSource<OsmObject>>();
    private static historyCache = new Map<string, UIEventSource<OsmObject[]>>();
    type: "node" | "way" | "relation";
    id: number;
    /**
     * The OSM tags as simple object
     */
    tags: {} = {};
    version: number;
    public changed: boolean = false;
    timestamp: Date;

    protected constructor(type: string, id: number) {
        this.id = id;
        // @ts-ignore
        this.type = type;
        this.tags = {
            id: `${this.type}/${id}`
        }
    }

    public static SetBackendUrl(url: string) {
        if (!url.endsWith("/")) {
            throw "Backend URL must end with a '/'"
        }
        if (!url.startsWith("http")) {
            throw "Backend URL must begin with http"
        }
        this.backendURL = url;
    }

    public static DownloadObject(id: string, forceRefresh: boolean = false): UIEventSource<OsmObject> {
        let src: UIEventSource<OsmObject>;
        if (OsmObject.objectCache.has(id)) {
            src = OsmObject.objectCache.get(id)
            if (forceRefresh) {
                src.setData(undefined)
            } else {
                return src;
            }
        } else {
            src = UIEventSource.FromPromise(OsmObject.DownloadObjectAsync(id))
        }

        OsmObject.objectCache.set(id, src);
        return src;
    }
    
    static async DownloadPropertiesOf(id: string): Promise<any> {
        const splitted = id.split("/");
        const type = splitted[0];
        const idN = Number(splitted[1]);
        if (idN < 0) {
            return undefined;
        }

        const url = `${OsmObject.backendURL}api/0.6/${id}`;
        const rawData = await Utils.downloadJson(url)
        return rawData.elements[0].tags
    }

    static async DownloadObjectAsync(id: string): Promise<OsmObject> {
        const splitted = id.split("/");
        const type = splitted[0];
        const idN = Number(splitted[1]);
        if (idN < 0) {
            return undefined;
        }

        const full = (id.startsWith("way")) ? "/full" : "";
        const url = `${OsmObject.backendURL}api/0.6/${id}${full}`;
        const rawData = await Utils.downloadJson(url)
        // A full query might contain more then just the requested object (e.g. nodes that are part of a way, where we only want the way)
        const parsed = OsmObject.ParseObjects(rawData.elements);
        // Lets fetch the object we need
        for (const osmObject of parsed) {
            if(osmObject.type !== type){
                continue;
            }
            if(osmObject.id !== idN){
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
        return Utils.downloadJson(`${OsmObject.backendURL}api/0.6/${id}/ways`).then(
            data => {
                return data.elements.map(wayInfo => {
                    const way = new OsmWay(wayInfo.id)
                    way.LoadData(wayInfo)
                    return way
                })
            }
        )
    }

    /**
     * Downloads the relations that are using this feature.
     * Beware: their geometry will be incomplete!
     */
    public static async DownloadReferencingRelations(id: string): Promise<OsmRelation[]> {
        const data = await Utils.downloadJson(`${OsmObject.backendURL}api/0.6/${id}/relations`)
        return data.elements.map(wayInfo => {
            const rel = new OsmRelation(wayInfo.id)
            rel.LoadData(wayInfo)
            rel.SaveExtraData(wayInfo)
            return rel
        })
    }

    public static DownloadHistory(id: string): UIEventSource<OsmObject []> {
        if (OsmObject.historyCache.has(id)) {
            return OsmObject.historyCache.get(id)
        }
        const splitted = id.split("/");
        const type = splitted[0];
        const idN = Number(splitted[1]);
        const src = new UIEventSource<OsmObject[]>([]);
        OsmObject.historyCache.set(id, src);
        Utils.downloadJson(`${OsmObject.backendURL}api/0.6/${type}/${idN}/history`).then(data => {
            const elements: any[] = data.elements;
            const osmObjects: OsmObject[] = []
            for (const element of elements) {
                let osmObject: OsmObject = null
                switch (type) {
                    case("node"):
                        osmObject = new OsmNode(idN);
                        break;
                    case("way"):
                        osmObject = new OsmWay(idN);
                        break;
                    case("relation"):
                        osmObject = new OsmRelation(idN);
                        break;
                }
                osmObject?.LoadData(element);
                osmObject?.SaveExtraData(element, []);
                osmObjects.push(osmObject)
            }
            src.setData(osmObjects)
        })
        return src;
    }

    // bounds should be: [[maxlat, minlon], [minlat, maxlon]] (same as Utils.tile_bounds)
    public static async LoadArea(bbox: BBox): Promise<OsmObject[]> {
        const url = `${OsmObject.backendURL}api/0.6/map.json?bbox=${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`
        const data = await Utils.downloadJson(url)
        const elements: any[] = data.elements;
        return OsmObject.ParseObjects(elements);
    }
    protected static isPolygon(tags: any): boolean {
        for (const tagsKey in tags) {
            if (!tags.hasOwnProperty(tagsKey)) {
                continue
            }
            const polyGuide = OsmObject.polygonFeatures.get(tagsKey)
            if (polyGuide === undefined) {
                continue
            }
            if ((polyGuide.values === null)) {
                // We match all
                return !polyGuide.blacklist
            }
            // is the key contained?
            return polyGuide.values.has(tags[tagsKey])
        }
    }

    private static constructPolygonFeatures(): Map<string, { values: Set<string>, blacklist: boolean }> {
        const result = new Map<string, { values: Set<string>, blacklist: boolean }>();
        for (const polygonFeature of polygon_features) {
            const key = polygonFeature.key;

            if (polygonFeature.polygon === "all") {
                result.set(key, {values: null, blacklist: false})
                continue
            }

            const blacklist = polygonFeature.polygon === "blacklist"
            result.set(key, {values: new Set<string>(polygonFeature.values), blacklist: blacklist})

        }

        return result;
    }

    private static ParseObjects(elements: any[]): OsmObject[] {
        const objects: OsmObject[] = [];
        const allNodes: Map<number, OsmNode> = new Map<number, OsmNode>()

        for (const element of elements) {
            const type = element.type;
            const idN = element.id;
            let osmObject: OsmObject = null
            switch (type) {
                case("node"):
                    const node = new OsmNode(idN);
                    allNodes.set(idN, node);
                    osmObject = node
                    node.SaveExtraData(element);
                    break;
                case("way"):
                    osmObject = new OsmWay(idN);
                    const nodes = element.nodes.map(i => allNodes.get(i));
                    osmObject.SaveExtraData(element, nodes)
                    break;
                case("relation"):
                    osmObject = new OsmRelation(idN);
                    osmObject.SaveExtraData(element, [])
                    break;
            }
            
            if (osmObject !== undefined && OsmObject.backendURL !== OsmObject.defaultBackend) {
                osmObject.tags["_backend"] = OsmObject.backendURL
            }
            
            osmObject?.LoadData(element)
            objects.push(osmObject)
        }
        return objects;
    }

    // The centerpoint of the feature, as [lat, lon]
    public abstract centerpoint(): [number, number];

    public abstract asGeoJson(): any;

    abstract SaveExtraData(element: any, allElements: OsmObject[]);

    /**
     * Generates the changeset-XML for tags
     * @constructor
     */
    TagsXML(): string {
        let tags = "";
        for (const key in this.tags) {
            if (key.startsWith("_")) {
                continue;
            }
            if (key === "id") {
                continue;
            }
            const v = this.tags[key];
            if (v !== "") {
                tags += '        <tag k="' + Utils.EncodeXmlValue(key) + '" v="' + Utils.EncodeXmlValue(this.tags[key]) + '"/>\n'
            }
        }
        return tags;
    }

    abstract ChangesetXML(changesetId: string): string;

    protected VersionXML() {
        if (this.version === undefined) {
            return "";
        }
        return 'version="' + this.version + '"';
    }

    private LoadData(element: any): void {
        this.tags = element.tags ?? this.tags;
        this.version = element.version;
        this.timestamp = element.timestamp;
        const tgs = this.tags;
        if (element.tags === undefined) {
            // Simple node which is part of a way - not important
            return;
        }
        tgs["_last_edit:contributor"] = element.user
        tgs["_last_edit:contributor:uid"] = element.uid
        tgs["_last_edit:changeset"] = element.changeset
        tgs["_last_edit:timestamp"] = element.timestamp
        tgs["_version_number"] = element.version
        tgs["id"] = this.type + "/" + this.id;
    }
}


export class OsmNode extends OsmObject {

    lat: number;
    lon: number;

    constructor(id: number) {
        super("node", id);

    }

    ChangesetXML(changesetId: string): string {
        let tags = this.TagsXML();

        return '    <node id="' + this.id + '" changeset="' + changesetId + '" ' + this.VersionXML() + ' lat="' + this.lat + '" lon="' + this.lon + '">\n' +
            tags +
            '    </node>\n';
    }

    SaveExtraData(element) {
        this.lat = element.lat;
        this.lon = element.lon;
    }

    centerpoint(): [number, number] {
        return [this.lat, this.lon];
    }

    asGeoJson() {
        return {
            "type": "Feature",
            "properties": this.tags,
            "geometry": {
                "type": "Point",
                "coordinates": [
                    this.lon,
                    this.lat
                ]
            }
        }
    }
}

export class OsmWay extends OsmObject {

    nodes: number[] = [];
    // The coordinates of the way, [lat, lon][]
    coordinates: [number, number][] = []
    lat: number;
    lon: number;

    constructor(id: number) {
        super("way", id);
    }

    centerpoint(): [number, number] {
        return [this.lat, this.lon];
    }

    ChangesetXML(changesetId: string): string {
        let tags = this.TagsXML();
        let nds = "";
        for (const node in this.nodes) {
            nds += '      <nd ref="' + this.nodes[node] + '"/>\n';
        }

        return '    <way id="' + this.id + '" changeset="' + changesetId + '" ' + this.VersionXML() + '>\n' +
            nds +
            tags +
            '    </way>\n';
    }

    SaveExtraData(element, allNodes: OsmNode[]) {

        let latSum = 0
        let lonSum = 0

        const nodeDict = new Map<number, OsmNode>()
        for (const node of allNodes) {
            nodeDict.set(node.id, node)
        }

        if (element.nodes === undefined) {
            console.log("PANIC")
        }

        for (const nodeId of element.nodes) {
            const node = nodeDict.get(nodeId)
            if (node === undefined) {
                console.error("Error: node ", nodeId, "not found in ", nodeDict)
                // This is probably part of a relation which hasn't been fully downloaded
                continue;
            }
            const cp = node.centerpoint();
            this.coordinates.push(cp);
            latSum += cp[0]
            lonSum += cp[1]
        }
        let count = this.coordinates.length;
        this.lat = latSum / count;
        this.lon = lonSum / count;
        this.nodes = element.nodes;
    }

    public asGeoJson() {
        let coordinates: ([number, number][] | [number, number][][]) = this.coordinates.map(c => [c[1], c[0]]);
        if (this.isPolygon()) {
            coordinates = [coordinates]
        }
        return {
            "type": "Feature",
            "properties": this.tags,
            "geometry": {
                "type": this.isPolygon() ? "Polygon" : "LineString",
                "coordinates": coordinates
            }
        }
    }

    private isPolygon(): boolean {
        if (this.coordinates[0] !== this.coordinates[this.coordinates.length - 1]) {
            return false; // Not closed
        }
        return OsmObject.isPolygon(this.tags)

    }
}

export class OsmRelation extends OsmObject {

    public members: {
        type: "node" | "way" | "relation",
        ref: number,
        role: string
    }[];

    constructor(id: number) {
        super("relation", id);
    }

    centerpoint(): [number, number] {
        return [0, 0]; // TODO
    }

    ChangesetXML(changesetId: string): string {
        let members = "";
        for (const member of this.members) {
            members += '      <member type="' + member.type + '" ref="' + member.ref + '" role="' + member.role + '"/>\n';
        }

        let tags = this.TagsXML();
        let cs = ""
        if (changesetId !== undefined) {
            cs = `changeset="${changesetId}"`
        }
        return `    <relation id="${this.id}" ${cs} ${this.VersionXML()}>
${members}${tags}        </relation>
`;

    }

    SaveExtraData(element) {
        this.members = element.members;
    }

    asGeoJson(): any {
        throw "Not Implemented"
    }
}