import * as $ from "jquery"
import {Utils} from "../../Utils";


export abstract class OsmObject {

    type: string;
    id: number;
    tags: {} = {};
    version: number;
    public changed: boolean = false;

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
            console.log("Received: ", element, "with meta", meta);
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

        console.log("Downloading ", neededId);
        OsmObject.DownloadObject(neededId,
            function (element) {
                knownElements[neededId] = element; // assign the element for later, continue downloading the next element
                OsmObject.DownloadAll(neededIds, knownElements, continuation);
            }
        );
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
                const element = data.elements[data.elements.length - 1];
                self.tags = element.tags;
                const tgs = self.tags;
                tgs["_last_edit:contributor"] = element.user
                tgs["_last_edit:contributor:uid"] = element.uid
                tgs["_last_edit:changeset"] = element.changeset
                tgs["_last_edit:timestamp"] = element.timestamp
                tgs["_version_number"] = element.version
                tgs["id"] = self.type+"/"+self.id;

                self.version = element.version;
                self.SaveExtraData(element, data.elements);
                continuation(self, {
                    "_last_edit:contributor": element.user,
                    "_last_edit:contributor:uid": element.uid,
                    "_last_edit:changeset": element.changeset,
                    "_last_edit:timestamp": new Date(element.timestamp),
                    "_version_number": element.version
                });
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
            console.log("WARNING: overwriting ", oldV, " with ", v, " for key ", k)
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

    SaveExtraData(element, allNodes) {
        console.log("Way-extras: ", allNodes)

        
        for (const node of allNodes) {
            if (node.type === "node") {
                const n = new OsmNode(node.id);
                n.SaveExtraData(node)
                const cp = n.centerpoint();
                this.coordinates.push(cp);
            }
        }
        let count = this.coordinates.length;
        this.lat = this.coordinates.map(c => c[0]).reduce((a, b) => a + b, 0) / count;
        this.lon = this.coordinates.map(c => c[1]).reduce((a, b) => a + b, 0) / count;
        this.nodes = element.nodes;
    }

    asGeoJson() {
        return {
            "type": "Feature",
            "properties": this.tags,
            "geometry": {
                "type": "LineString",
                "coordinates": this.coordinates.map(c => [c[1], c[0]])
            }
        }
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