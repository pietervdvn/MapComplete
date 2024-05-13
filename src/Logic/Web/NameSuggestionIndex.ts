import * as nsi from "../../../node_modules/name-suggestion-index/dist/nsi.json"
import * as nsiFeatures from "../../../node_modules/name-suggestion-index/dist/featureCollection.json"
import { LocationConflation } from "@rapideditor/location-conflation"
import type { Feature, FeatureCollection, MultiPolygon } from "geojson"
import * as turf from "@turf/turf"
import { Utils } from "../../Utils"
import TagInfo from "./TagInfo"
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

    private static _supportedTypes: string[]

    public static supportedTypes(): string[] {
        if (this._supportedTypes) {
            return this._supportedTypes
        }
        const keys = Object.keys(NameSuggestionIndex.nsiFile.nsi)
        const all = keys.map(k => NameSuggestionIndex.nsiFile.nsi[k].properties.path.split("/")[0])
        this._supportedTypes = Utils.Dedup(all)
        return this._supportedTypes
    }

    public static async buildTaginfoCountsPerCountry(type = "brand", key: string, value: string) {
        const allData: { nsi: NSIItem, stats }[] = []
        const brands = NameSuggestionIndex.getSuggestionsFor(type, key, value)
        for (const brand of brands) {
            const brandValue = brand.tags[type]
            const allStats = await TagInfo.getGlobalDistributionsFor(type, brandValue)
            allData.push({ nsi: brand, stats: allStats })
        }
        return allData
    }

    public static supportedTags(type: "operator" | "brand" | "flag" | "transit" | string): Record<string, string[]> {
        const tags: Record<string, string []> = {}
        const keys = Object.keys(NameSuggestionIndex.nsiFile.nsi)
        for (const key of keys) {

            const nsiItem = NameSuggestionIndex.nsiFile.nsi[key]
            const path = nsiItem.properties.path
            const [osmType, osmkey, osmvalue] = path.split("/")
            if (type !== osmType && (type + "s" !== osmType)) {
                continue
            }
            if (!tags[osmkey]) {
                tags[osmkey] = []
            }
            tags[osmkey].push(osmvalue)
        }
        return tags
    }

    public static allPossible(type: "brand" | "operator"): string[] {
        const options: string[] = []
        const tags = NameSuggestionIndex.supportedTags(type)
        for (const osmKey in tags) {
            const values = tags[osmKey]
            for (const osmValue of values) {
                const suggestions = this.getSuggestionsFor(type, osmKey, osmValue)
                for (const suggestion of suggestions) {
                    const value = suggestion.tags[type]
                    options.push(value)
                }
            }
        }
        return Utils.Dedup(options)
    }

    /**
     *
     * @param path
     * @param country
     * @param location: center point of the feature, should be [lon, lat]
     */
    public static getSuggestionsFor(type: string, key: string, value: string, country: string = undefined, location: [number, number] = undefined): NSIItem[] {
        const path = `${type}s/${key}/${value}`
        const entry = NameSuggestionIndex.nsiFile.nsi[path]
        return entry?.items?.filter(i => {
            if (i.locationSet.include.indexOf("001") >= 0) {
                return true
            }

            if (country === undefined ||
                // We prefer the countries provided by lonlat2country, they are more precise
                // Country might contain multiple countries, separated by ';'
                i.locationSet.include.some(c => country.indexOf(c) >= 0)) {
                return true
            }

            if (location === undefined) {
                return true
            }
            const resolvedSet = NameSuggestionIndex.loco.resolveLocationSet(i.locationSet)

            if (resolvedSet) {
                // We actually have a location set, so we can check if the feature is in it, by determining if our point is inside the MultiPolygon using @turf/boolean-point-in-polygon
                // This might occur for some extra boundaries, such as counties, ...
                const setFeature: Feature<MultiPolygon> = resolvedSet.feature
                return turf.booleanPointInPolygon(location, setFeature.geometry)
            }

            return false
        })
    }
}
