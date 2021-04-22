import {TagsFilter} from "../../Logic/Tags/TagsFilter";

export default class SourceConfig {

    osmTags?: TagsFilter;
    overpassScript?: string;
    geojsonSource?: string;
    geojsonZoomLevel?: number;

    constructor(params: {
        osmTags?: TagsFilter,
        overpassScript?: string,
        geojsonSource?: string,
        geojsonSourceLevel?: number
    }) {

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
            throw "Source: nothing correct defined in the source"
        }
        this.osmTags = params.osmTags;
        this.overpassScript = params.overpassScript;
        this.geojsonSource = params.geojsonSource;
        this.geojsonZoomLevel = params.geojsonSourceLevel;
    }
}