import {TagsFilter} from "../../Logic/Tags/TagsFilter";

export default class SourceConfig {

    osmTags?: TagsFilter;
    overpassScript?: string;
    geojsonSource?: string;
    geojsonZoomLevel?: number;
    isOsmCacheLayer: boolean;

    constructor(params: {
        osmTags?: TagsFilter,
        overpassScript?: string,
        geojsonSource?: string,
        isOsmCache?: boolean,
        geojsonSourceLevel?: number
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
        if(params.isOsmCache && params.geojsonSource == undefined){
            console.error(params)
            throw `Source said it is a OSM-cached layer, but didn't define the actual source of the cache (in context ${context})`
        }
        this.osmTags = params.osmTags;
        this.overpassScript = params.overpassScript;
        this.geojsonSource = params.geojsonSource;
        this.geojsonZoomLevel = params.geojsonSourceLevel;
        this.isOsmCacheLayer = params.isOsmCache ?? false;
    }
}