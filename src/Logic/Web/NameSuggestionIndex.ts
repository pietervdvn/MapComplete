import * as nsi from "../../../node_modules/name-suggestion-index/dist/nsi.json"
import * as nsiFeatures from "../../../node_modules/name-suggestion-index/dist/featureCollection.json"
import { LocationConflation } from "@rapideditor/location-conflation"
import type { Feature, MultiPolygon } from "geojson"
import * as turf from "@turf/turf"

/**
 * Main name suggestion index file
 */
interface NSIFile {
    _meta: {
        version: string
        generated: string
        url: string
        hash: string
    }
    nsi: {
        [path: string]: NSIEntry
    }
}

/**
 * A collection of brands/operators/flagpoles/... with common properties
 * See https://github.com/osmlab/name-suggestion-index/wiki/Category-Files for an introduction and
 * https://github.com/osmlab/name-suggestion-index/blob/main/schema/categories.json for a full breakdown
 */
interface NSIEntry {
    properties: {
        path: string
        skipCollection?: boolean
        preserveTags?: string[]
        exclude: unknown
    }
    items: NSIItem[]
}

/**
 * Represents a single brand/operator/flagpole/...
 */
export interface NSIItem {
    displayName: string
    id: string
    locationSet: {
        include: string[],
        exclude: string[]
    }
    tags: {
        [key: string]: string
    }
    fromTemplate?: boolean
}

export default class NameSuggestionIndex {

    private static readonly nsiFile: Readonly<NSIFile> = <any>nsi
    private static loco = new LocationConflation(nsiFeatures) // Some additional boundaries
    private static singleton: NameSuggestionIndex

    public static getSuggestionsFor(path: string, country: Set<string>): NSIItem[] {
        const entry = NameSuggestionIndex.nsiFile.nsi[path]
        return entry.items.filter(i => {
            if(i.locationSet.include.indexOf("001") >= 0){
                return true
            }
            if(i.locationSet.include.some(c => country.indexOf(c) >= 0)){
                return true
            }

            const resolvedSet = NameSuggestionIndex.loco.resolveLocationSet(item.locationSet)
            if (resolvedSet) {
                // We actually have a location set, so we can check if the feature is in it, by determining if our point is inside the MultiPolygon using @turf/boolean-point-in-polygon
                // This might occur for some extra boundaries, such as counties, ...
                const setFeature: Feature<MultiPolygon> = resolvedSet.feature
                return turf.booleanPointInPolygon([lon, lat], setFeature.geometry)
            }

            return false
        })
    }
}
