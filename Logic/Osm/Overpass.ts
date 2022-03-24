import {TagsFilter} from "../Tags/TagsFilter";
import RelationsTracker from "./RelationsTracker";
import {Utils} from "../../Utils";
import {UIEventSource} from "../UIEventSource";
import {BBox} from "../BBox";
import * as osmtogeojson from "osmtogeojson";
// @ts-ignore
import {Tag} from "../Tags/Tag"; // used in doctest

/**
 * Interfaces overpass to get all the latest data
 */
export class Overpass {
    private _filter: TagsFilter
    private readonly _interpreterUrl: string;
    private readonly _timeout: UIEventSource<number>;
    private readonly _extraScripts: string[];
    private _includeMeta: boolean;
    private _relationTracker: RelationsTracker;

    constructor(filter: TagsFilter,
                extraScripts: string[],
                interpreterUrl: string,
                timeout?: UIEventSource<number>,
                relationTracker?: RelationsTracker,
                includeMeta = true) {
        this._timeout = timeout ?? new UIEventSource<number>(90);
        this._interpreterUrl = interpreterUrl;
        const optimized = filter.optimize()
        if(optimized === true || optimized === false){
            throw "Invalid filter: optimizes to true of false"
        }
        this._filter = optimized
        this._extraScripts = extraScripts;
        this._includeMeta = includeMeta;
        this._relationTracker = relationTracker
    }

    public async queryGeoJson(bounds: BBox): Promise<[any, Date]> {

        let query = this.buildQuery("[bbox:" + bounds.getSouth() + "," + bounds.getWest() + "," + bounds.getNorth() + "," + bounds.getEast() + "]")

        const self = this;
        const json = await Utils.downloadJson(query)

        if (json.elements.length === 0 && json.remark !== undefined) {
            console.warn("Timeout or other runtime error while querying overpass", json.remark);
            throw `Runtime error (timeout or similar)${json.remark}`
        }
        if (json.elements.length === 0) {
            console.warn("No features for", json)
        }

        self._relationTracker?.RegisterRelations(json)
        const geojson = osmtogeojson.default(json);
        const osmTime = new Date(json.osm3s.timestamp_osm_base);
        return [geojson, osmTime];
    }

    /**
     * new Overpass(new Tag("key","value"), [], "").buildScript("{{bbox}}") // => `[out:json][timeout:90]{{bbox}};(nwr["key"="value"];);out body;out meta;>;out skel qt;`
     */
    public buildScript(bbox: string, postCall: string = "", pretty = false): string {
        const filters = this._filter.asOverpass()
        let filter = ""
        for (const filterOr of filters) {
            if(pretty){
                filter += "    "
            }
            filter += 'nwr' + filterOr + postCall + ';'
            if(pretty){
                filter+="\n"
            }
        }
        for (const extraScript of this._extraScripts) {
            filter += '(' + extraScript + ');';
        }
        return`[out:json][timeout:${this._timeout.data}]${bbox};(${filter});out body;${this._includeMeta ? 'out meta;' : ''}>;out skel qt;`
    }
    
    public buildQuery(bbox: string): string {
        const query = this.buildScript(bbox)
        return `${this._interpreterUrl}?data=${encodeURIComponent(query)}`
    }

    /**
     * Little helper method to quickly open overpass-turbo in the browser
     */
    public static AsOverpassTurboLink(tags: TagsFilter){
        const overpass = new Overpass(tags, [], "", undefined, undefined, false)
        const script = overpass.buildScript("","({{bbox}})", true)
        const url = "http://overpass-turbo.eu/?Q="
        return url + encodeURIComponent(script)
    }
}
