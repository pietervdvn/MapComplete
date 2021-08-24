import * as OsmToGeoJson from "osmtogeojson";
import Bounds from "../../Models/Bounds";
import {TagsFilter} from "../Tags/TagsFilter";
import ExtractRelations from "./ExtractRelations";
import {Utils} from "../../Utils";
import {UIEventSource} from "../UIEventSource";

/**
 * Interfaces overpass to get all the latest data
 */
export class Overpass {
    public static testUrl: string = null
    private _filter: TagsFilter
    private readonly _interpreterUrl: UIEventSource<string>;
    private readonly _timeout: UIEventSource<number>;
    private readonly _extraScripts: string[];
    private _includeMeta: boolean;
    
    constructor(filter: TagsFilter, extraScripts: string[],
                interpreterUrl: UIEventSource<string>,
                timeout: UIEventSource<number>,
                includeMeta = true) {
        this._timeout = timeout;
        this._interpreterUrl = interpreterUrl;
        this._filter = filter
        this._extraScripts = extraScripts;
        this._includeMeta = includeMeta;
    }

    queryGeoJson(bounds: Bounds, continuation: ((any, date: Date) => void), onFail: ((reason) => void)): void {

        let query = this.buildQuery("[bbox:" + bounds.south + "," + bounds.west + "," + bounds.north + "," + bounds.east + "]")

        if (Overpass.testUrl !== null) {
            console.log("Using testing URL")
            query = Overpass.testUrl;
        }
        Utils.downloadJson(query)
            .then(json => {
                if (json.elements === [] && ((json.remarks ?? json.remark).indexOf("runtime error") >= 0)) {
                    console.log("Timeout or other runtime error");
                    onFail("Runtime error (timeout)")
                    return;
                }
                

                ExtractRelations.RegisterRelations(json)
                // @ts-ignore
                const geojson = OsmToGeoJson.default(json);
                const osmTime = new Date(json.osm3s.timestamp_osm_base);

                continuation(geojson, osmTime);
            }).catch(onFail)
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
        return `${this._interpreterUrl.data}?data=${encodeURIComponent(query)}`
    }
}
