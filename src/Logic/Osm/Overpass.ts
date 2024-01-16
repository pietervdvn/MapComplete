import { TagsFilter } from "../Tags/TagsFilter"
import { Utils } from "../../Utils"
import { ImmutableStore, Store } from "../UIEventSource"
import { BBox } from "../BBox"
import osmtogeojson from "osmtogeojson"
import { FeatureCollection } from "@turf/turf"

/**
 * Interfaces overpass to get all the latest data
 */
export class Overpass {
    private _filter: TagsFilter
    private readonly _interpreterUrl: string
    private readonly _timeout: Store<number>
    private readonly _extraScripts: string[]
    private readonly _includeMeta: boolean

    constructor(
        filter: TagsFilter,
        extraScripts: string[],
        interpreterUrl: string,
        timeout?: Store<number>,
        includeMeta = true
    ) {
        this._timeout = timeout ?? new ImmutableStore<number>(90)
        this._interpreterUrl = interpreterUrl
        const optimized = filter.optimize()
        if (optimized === true || optimized === false) {
            throw "Invalid filter: optimizes to true of false"
        }
        this._filter = optimized
        this._extraScripts = extraScripts
        this._includeMeta = includeMeta
    }

    public async queryGeoJson(bounds: BBox): Promise<[FeatureCollection, Date]> {
        const bbox =
            "[bbox:" +
            bounds.getSouth() +
            "," +
            bounds.getWest() +
            "," +
            bounds.getNorth() +
            "," +
            bounds.getEast() +
            "]"
        const query = this.buildScript(bbox)
        return await this.ExecuteQuery(query)
    }

    public buildUrl(query: string) {
        return `${this._interpreterUrl}?data=${encodeURIComponent(query)}`
    }

    private async ExecuteQuery(query: string): Promise<[FeatureCollection, Date]> {
        const json = await Utils.downloadJson(this.buildUrl(query))

        if (json.elements.length === 0 && json.remark !== undefined) {
            console.warn("Timeout or other runtime error while querying overpass", json.remark)
            throw `Runtime error (timeout or similar)${json.remark}`
        }
        if (json.elements.length === 0) {
            console.warn("No features for", json)
        }

        const geojson = osmtogeojson(json)
        const osmTime = new Date(json.osm3s.timestamp_osm_base)
        return [<any>geojson, osmTime]
    }

    /**
     * Constructs the actual script to execute on Overpass
     * 'PostCall' can be used to set an extra range, see 'AsOverpassTurboLink'
     *
     * import {Tag} from "../Tags/Tag";
     *
     * new Overpass(new Tag("key","value"), [], "").buildScript("{{bbox}}") // => `[out:json][timeout:90]{{bbox}};(nwr["key"="value"];);out body;out meta;>;out skel qt;`
     */
    public buildScript(bbox: string, postCall: string = "", pretty = false): string {
        const filters = this._filter.asOverpass()
        let filter = ""
        for (const filterOr of filters) {
            if (pretty) {
                filter += "    "
            }
            filter += "nwr" + filterOr + postCall + ";"
            if (pretty) {
                filter += "\n"
            }
        }
        for (const extraScript of this._extraScripts) {
            filter += "(" + extraScript + ");"
        }
        return `[out:json][timeout:${this._timeout.data}]${bbox};(${filter});out body;${
            this._includeMeta ? "out meta;" : ""
        }>;out skel qt;`
    }
    /**
     * Constructs the actual script to execute on Overpass with geocoding
     * 'PostCall' can be used to set an extra range, see 'AsOverpassTurboLink'
     */
    public buildScriptInArea(
        area: { osm_type: "way" | "relation"; osm_id: number },
        pretty = false
    ): string {
        const filters = this._filter.asOverpass()
        let filter = ""
        for (const filterOr of filters) {
            if (pretty) {
                filter += "    "
            }
            filter += "nwr" + filterOr + "(area.searchArea);"
            if (pretty) {
                filter += "\n"
            }
        }
        for (const extraScript of this._extraScripts) {
            filter += "(" + extraScript + ");"
        }
        let id = area.osm_id
        if (area.osm_type === "relation") {
            id += 3600000000
        }
        return `[out:json][timeout:${this._timeout.data}];
        area(id:${id})->.searchArea;
        (${filter});
        out body;${this._includeMeta ? "out meta;" : ""}>;out skel qt;`
    }

    public buildQuery(bbox: string) {
        return this.buildUrl(this.buildScript(bbox))
    }

    /**
     * Little helper method to quickly open overpass-turbo in the browser
     */
    public static AsOverpassTurboLink(tags: TagsFilter) {
        const overpass = new Overpass(tags, [], "", undefined, false)
        const script = overpass.buildScript("", "({{bbox}})", true)
        const url = "http://overpass-turbo.eu/?Q="
        return url + encodeURIComponent(script)
    }
}
