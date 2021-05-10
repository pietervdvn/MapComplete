import * as $ from "jquery"
import * as OsmToGeoJson from "osmtogeojson";
import Bounds from "../../Models/Bounds";
import {TagsFilter} from "../Tags/TagsFilter";
import ExtractRelations from "./ExtractRelations";

/**
 * Interfaces overpass to get all the latest data
 */
export class Overpass {
    public static testUrl: string = null
    private _filter: TagsFilter
    private readonly _extraScripts: string[];
    private _includeMeta: boolean;

    constructor(filter: TagsFilter, extraScripts: string[], includeMeta = true) {
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
        $.getJSON(query,
            function (json, status) {
                if (status !== "success") {
                    console.log("Query failed")
                    onFail(status);
                    return;
                }

                if (json.elements === [] && json.remarks.indexOf("runtime error") > 0) {
                    console.log("Timeout or other runtime error");
                    onFail("Runtime error (timeout)")
                    return;
                }

                ExtractRelations.RegisterRelations(json)
                // @ts-ignore
                const geojson = OsmToGeoJson.default(json);
                const osmTime = new Date(json.osm3s.timestamp_osm_base);

                continuation(geojson, osmTime);

            }).fail(onFail)
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
            `[out:json][timeout:25]${bbox};(${filter});out body;${this._includeMeta ? 'out meta;' : ''}>;out skel qt;`
        return "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query)
    }
}
