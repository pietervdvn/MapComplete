import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import {RegexTag} from "../../Logic/Tags/RegexTag";

export default class SourceConfig {

    public readonly osmTags?: TagsFilter;
    public readonly overpassScript?: string;
    public readonly geojsonSource?: string;
    public readonly geojsonZoomLevel?: number;
    public readonly isOsmCacheLayer: boolean;
   public readonly mercatorCrs: boolean;

    constructor(params: {
        mercatorCrs?: boolean;
        osmTags?: TagsFilter,
        overpassScript?: string,
        geojsonSource?: string,
        isOsmCache?: boolean,
        geojsonSourceLevel?: number,
    }, context?: string) {

        let defined = 0;
        if (params.osmTags) {
            defined++;
        }
        if (params.overpassScript) {
            defined++;
        }
        if (params.geojsonSource) {
            defined++;
        }
        if (defined == 0) {
            throw `Source: nothing correct defined in the source (in ${context}) (the params are ${JSON.stringify(params)})`
        }
        if (params.isOsmCache && params.geojsonSource == undefined) {
            console.error(params)
            throw `Source said it is a OSM-cached layer, but didn't define the actual source of the cache (in context ${context})`
        }
        if(params.geojsonSource !== undefined && params.geojsonSourceLevel !== undefined){
            if(! ["x","y","x_min","x_max","y_min","Y_max"].some(toSearch => params.geojsonSource.indexOf(toSearch) > 0)){
                throw `Source defines a geojson-zoomLevel, but does not specify {x} nor {y} (or equivalent), this is probably a bug (in context ${context})`
        }}
        this.osmTags = params.osmTags ?? new RegexTag("id",/.*/);
        this.overpassScript = params.overpassScript;
        this.geojsonSource = params.geojsonSource;
        this.geojsonZoomLevel = params.geojsonSourceLevel;
        this.isOsmCacheLayer = params.isOsmCache ?? false;
        this.mercatorCrs = params.mercatorCrs ?? false;
    }
}