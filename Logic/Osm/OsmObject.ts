import * as $ from "jquery"
import {Utils} from "../../Utils";
import * as polygon_features from "../../assets/polygon-features.json";


export abstract class OsmObject {

    type: string;
    id: number;
    tags: {} = {};
    version: number;
    public changed: boolean = false;
    timestamp: Date;


    private static polygonFeatures = OsmObject.constructPolygonFeatures()

    protected constructor(type: string, id: number) {
        this.id = id;
        this.type = type;
        this.tags = {
            id: id
        }
    }

    static DownloadObject(id, continuation: ((element: OsmObject, meta: OsmObjectMeta) => void)) {
        const splitted = id.split("/");
        const type = splitted[0];
        const idN = splitted[1];

        const newContinuation = (element: OsmObject, meta: OsmObjectMeta) => {
            continuation(element, meta);
        }

        switch (type) {
            case("node"):
                return new OsmNode(idN).Download(newContinuation);
            case("way"):
                return new OsmWay(idN).Download(newContinuation);
            case("relation"):
                return new OsmRelation(idN).Download(newContinuation);

        }
    }

    public static DownloadHistory(id: string, continuation: (versions: OsmObject[]) => void): void {
        const splitted = id.split("/");
        const type = splitted[0];
        const idN = splitted[1];
        $.getJSON("https://openStreetMap.org/api/0.6/" + type + "/" + idN + "/history", data => {
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
            continuation(osmObjects)
        })
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

    // bounds should be: [[maxlat, minlon], [minlat, maxlon]] (same as Utils.tile_bounds)
    public static LoadArea(bounds: [[number, number], [number, number]], callback: (objects: OsmObject[]) => void) {
        const minlon = bounds[0][1]
        const maxlon = bounds[1][1]
        const minlat = bounds[1][0]
        const maxlat = bounds[0][0];
        const url = `https://www.openstreetmap.org/api/0.6/map.json?bbox=${minlon},${minlat},${maxlon},${maxlat}`
        $.getJSON(url, data => {
            const elements: any[] = data.elements;
            const objects = OsmObject.ParseObjects(elements)
            callback(objects);

        })
    }

    //Loads an area from the OSM-api.

    public static DownloadAll(neededIds, knownElements: any = {}, continuation: ((knownObjects: any) => void)) {
        // local function which downloads all the objects one by one
        // this is one big loop, running one download, then rerunning the entire function
        if (neededIds.length == 0) {
            continuation(knownElements);
            return;
        }
        const neededId = neededIds.pop();

        if (neededId in knownElements) {
            OsmObject.DownloadAll(neededIds, knownElements, continuation);
            return;
        }

        OsmObject.DownloadObject(neededId,
            function (element) {
                knownElements[neededId] = element; // assign the element for later, continue downloading the next element
                OsmObject.DownloadAll(neededIds, knownElements, continuation);
            }
        );
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
            osmObject?.LoadData(element)
            objects.push(osmObject)
        }
        return objects;
    }

    // The centerpoint of the feature, as [lat, lon]
    public abstract centerpoint(): [number, number];

    public abstract asGeoJson(): any;

    abstract SaveExtraData(element: any, allElements: any[]);

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

    Download(continuation: ((element: OsmObject, meta: OsmObjectMeta) => void)) {
        const self = this;
        const full = this.type !== "way" ? "" : "/full";
        const url = "https://www.openstreetmap.org/api/0.6/" + this.type + "/" + this.id + full;
        $.getJSON(url, function (data) {

                const element = data.elements.pop();

                let nodes = []
                if (data.elements.length > 2) {
                    nodes = OsmObject.ParseObjects(data.elements)
                }

                self.LoadData(element)
                self.SaveExtraData(element, nodes);
                const meta = {
                    "_last_edit:contributor": element.user,
                    "_last_edit:contributor:uid": element.uid,
                    "_last_edit:changeset": element.changeset,
                    "_last_edit:timestamp": new Date(element.timestamp),
                    "_version_number": element.version
                }

                continuation(self, meta);
            }
        );
        return this;
    }

    public addTag(k: string, v: string): void {
        if (k in this.tags) {
            const oldV = this.tags[k];
            if (oldV == v) {
                return;
            }
            console.log("Overwriting ", oldV, " with ", v, " for key ", k)
        }
        this.tags[k] = v;
        if (v === undefined || v === "") {
            delete this.tags[k];
        }
        this.changed = true;
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

    constructor(id) {
        super("node", id);

    }

    ChangesetXML(changesetId: string): string {
        let tags = this.TagsXML();

        return '        <node id="' + this.id + '" changeset="' + changesetId + '" ' + this.VersionXML() + ' lat="' + this.lat + '" lon="' + this.lon + '">\n' +
            tags +
            '        </node>\n';
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

export interface OsmObjectMeta {
    "_last_edit:contributor": string,
    "_last_edit:contributor:uid": number,
    "_last_edit:changeset": number,
    "_last_edit:timestamp": Date,
    "_version_number": number

}

export class OsmWay extends OsmObject {

    nodes: number[];
    coordinates: [number, number][] = []
    lat: number;
    lon: number;

    constructor(id) {
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
            '        </way>\n';
    }

    SaveExtraData(element, allNodes: OsmNode[]) {

        let latSum = 0
        let lonSum = 0

        console.log("element is", element, "nodes are", allNodes)

        const nodeDict = new Map<number, OsmNode>()
        for (const node of allNodes) {
            nodeDict.set(node.id, node)
        }

        for (const nodeId of element.nodes) {
            const node = nodeDict.get(nodeId)
            const cp = node.centerpoint();
            this.coordinates.push(cp);
            latSum = cp[0]
            lonSum = cp[1]
        }
        let count = this.coordinates.length;
        this.lat = latSum / count;
        this.lon = lonSum / count;
        this.nodes = element.nodes;
    }

    asGeoJson() {
        return {
            "type": "Feature",
            "properties": this.tags,
            "geometry": {
                "type": this.isPolygon() ? "Polygon" : "LineString",
                "coordinates": this.coordinates.map(c => [c[1], c[0]])
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

    members;

    constructor(id) {
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
        return '    <relation id="' + this.id + '" changeset="' + changesetId + '" ' + this.VersionXML() + '>\n' +
            members +
            tags +
            '        </relation>\n';

    }

    SaveExtraData(element) {
        this.members = element.members;
    }

    asGeoJson() {
        throw "Not Implemented"
    }
}