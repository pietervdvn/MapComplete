import {TagsFilter} from "../../Logic/Tags";

export default class SourceConfig {

    osmTags?: TagsFilter;
    overpassScript?: string;
    geojsonSource?: string;

    constructor(params: {
        osmTags?: TagsFilter,
        overpassScript?: string,
        geojsonSource?: string
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
    }
}