import {TagsFilter} from "../Tags/TagsFilter";
import RelationsTracker from "./RelationsTracker";
import {Utils} from "../../Utils";
import {UIEventSource} from "../UIEventSource";
import {BBox} from "../BBox";
import * as osmtogeojson from "osmtogeojson";

/**
 * Interfaces overpass to get all the latest data
 */
export class Overpass {
    public static testUrl: string = null
    private _filter: TagsFilter
    private readonly _interpreterUrl: string;
    private readonly _timeout: UIEventSource<number>;
    private readonly _extraScripts: string[];
    private _includeMeta: boolean;
    private _relationTracker: RelationsTracker;


    constructor(filter: TagsFilter,
                extraScripts: string[],
                interpreterUrl: string,
                timeout: UIEventSource<number>,
                relationTracker: RelationsTracker,
                includeMeta = true) {
        this._timeout = timeout;
        this._interpreterUrl = interpreterUrl;
        this._filter = filter
        this._extraScripts = extraScripts;
        this._includeMeta = includeMeta;
        this._relationTracker = relationTracker
    }

    public async queryGeoJson(bounds: BBox): Promise<[any, Date]> {

        let query = this.buildQuery("[bbox:" + bounds.getSouth() + "," + bounds.getWest() + "," + bounds.getNorth() + "," + bounds.getEast() + "]")

        if (Overpass.testUrl !== null) {
            console.log("Using testing URL")
            query = Overpass.testUrl;
        }
        const self = this;
        const json = await Utils.downloadJson(query)

        if (json.elements.length === 0 && json.remark !== undefined) {
            console.warn("Timeout or other runtime error while querying overpass", json.remark);
            throw `Runtime error (timeout or similar)${json.remark}`
        }
        if (json.elements.length === 0) {
            console.warn("No features for", json)
        }

        self._relationTracker.RegisterRelations(json)
        console.warn("OSMTOGEOJSON:", osmtogeojson)
        const geojson = osmtogeojson.default(json);
        const osmTime = new Date(json.osm3s.timestamp_osm_base);
        return [geojson, osmTime];
    }

    buildQuery(bbox: string): string {
        const filters = this._filter.asOverpass()
        let filter = ""
        for (const filterOr of filters) {
            filter += 'nwr' + filterOr + ';'
        }
        for (const extraScript of this._extraScripts) {
            filter += '(' + extraScript + ');';
        }
        const query =
            `[out:json][timeout:${this._timeout.data}]${bbox};(${filter});out body;${this._includeMeta ? 'out meta;' : ''}>;out skel qt;`
        return `${this._interpreterUrl}?data=${encodeURIComponent(query)}`
    }
}
