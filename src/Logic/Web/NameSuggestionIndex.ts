import * as nsi from "../../../node_modules/name-suggestion-index/dist/nsi.json"
import * as nsiWD from "../../../node_modules/name-suggestion-index/dist/wikidata.min.json"

import * as nsiFeatures from "../../../node_modules/name-suggestion-index/dist/featureCollection.json"
import { LocationConflation } from "@rapideditor/location-conflation"
import type { Feature, MultiPolygon } from "geojson"
import { Utils } from "../../Utils"
import * as turf from "@turf/turf"
import { Mapping } from "../../Models/ThemeConfig/TagRenderingConfig"
import { Tag } from "../Tags/Tag"
import { TypedTranslation } from "../../UI/i18n/Translation"
import { RegexTag } from "../Tags/RegexTag"

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
    tags: Record<string, string>
    fromTemplate?: boolean
}

export default class NameSuggestionIndex {

    private static readonly nsiFile: Readonly<NSIFile> = <any>nsi
    private static readonly nsiWdFile: Readonly<Record<string, {
        logos: { wikidata?: string, facebook?: string }
    }>> = <any>nsiWD["wikidata"]

    private static loco = new LocationConflation(nsiFeatures) // Some additional boundaries

    private static _supportedTypes: string[]

    public static supportedTypes(): string[] {
        if (this._supportedTypes) {
            return this._supportedTypes
        }
        const keys = Object.keys(NameSuggestionIndex.nsiFile.nsi)
        const all = keys.map(k => NameSuggestionIndex.nsiFile.nsi[k].properties.path.split("/")[0])
        this._supportedTypes = Utils.Dedup(all).map(s => {
            if(s.endsWith("s")){
                s = s.substring(0, s.length - 1)
            }
            return s
        })
        return this._supportedTypes
    }


    /**
     * Fetches the data files for a single country. Note that it contains _all_ entries having this brand, not for a single type of object
     * @param type
     * @param countries
     * @private
     */
    private static async fetchFrequenciesFor(type: string, countries: string[]) {
        let stats = await Promise.all(countries.map(c => {
            try {
                return Utils.downloadJsonCached<Record<string, number>>(`./assets/data/nsi/stats/${type}.${c.toUpperCase()}.json`, 24 * 60 * 60 * 1000)
            } catch (e) {
                console.error("Could not fetch " + type + " statistics due to", e)
                return undefined
            }
        }))
        stats = Utils.NoNull(stats)
        if (stats.length === 1) {
            return stats[0]
        }
        if(stats.length === 0){
            return {}
        }
        const merged = stats[0]
        for (let i = 1; i < stats.length; i++) {
            for (const countryCode in stats[i]) {
                merged[countryCode] = (merged[countryCode] ?? 0) + stats[i][countryCode]
            }
        }
        return merged
    }

    public static isSvg(nsiItem: NSIItem, type: string): boolean | undefined {
        const logos = this.nsiWdFile[nsiItem?.tags?.[type + ":wikidata"]]?.logos
        if (!logos) {
            return undefined
        }
        if (logos.facebook) {
            return false
        }
        const url: string = logos.wikidata
        if (url.toLowerCase().endsWith(".svg")) {
            return true
        }
        return false
    }

    public static async generateMappings(type: string, tags: Record<string, string>, country: string[], location?: [number, number]): Promise<Mapping[]> {
        const mappings: Mapping[] = []
        const frequencies = await NameSuggestionIndex.fetchFrequenciesFor(type, country)
        for (const key in tags) {
            if (key.startsWith("_")) {
                continue
            }
            const value = tags[key]
            const actualBrands = NameSuggestionIndex.getSuggestionsForKV(type, key, value, country.join(";"), location)
            if(!actualBrands){
                continue
            }
            for (const nsiItem of actualBrands) {
                const tags = nsiItem.tags
                const frequency = frequencies[nsiItem.displayName]
                const logos = this.nsiWdFile[nsiItem.tags[type + ":wikidata"]]?.logos
                const iconUrl = logos?.facebook ?? logos?.wikidata
                const hasIcon = iconUrl !== undefined
                let icon = undefined
                if (hasIcon) {
                    // Using <img src=...> works fine without an extension for JPG and PNG, but _not_ svg :(
                    icon = "./assets/data/nsi/logos/" + nsiItem.id
                    if (NameSuggestionIndex.isSvg(nsiItem, type)) {
                        icon = icon + ".svg"
                    }
                }
                mappings.push({
                    if: new Tag(type, tags[type]),
                    addExtraTags: Object.keys(tags).filter(k => k !== type).map(k => new Tag(k, tags[k])),
                    then: new TypedTranslation<Record<string, never>>({ "*": nsiItem.displayName }),
                    hideInAnswer: false,
                    ifnot: undefined,
                    alsoShowIf: undefined,
                    icon,
                    iconClass: "medium",
                    priorityIf: frequency > 0 ? new RegexTag("id", /.*/) : undefined,
                    searchTerms: { "*": [nsiItem.displayName, nsiItem.id] }
                })
            }
        }
        return mappings
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

    /**
     * Returns a list of all brands/operators
     * @param type
     */
    public static allPossible(type: "brand" | "operator"): NSIItem[] {
        const options: NSIItem[] = []
        const tags = NameSuggestionIndex.supportedTags(type)
        for (const osmKey in tags) {
            const values = tags[osmKey]
            for (const osmValue of values) {
                const suggestions = this.getSuggestionsForKV(type, osmKey, osmValue)
                options.push(...suggestions)
            }
        }
        return (options)
    }

    /**
     *
     * @param country: a string containing one or more country codes, separated by ";"
     * @param location: center point of the feature, should be [lon, lat]
     */
    public static getSuggestionsFor(type: string, tags: {key: string, value: string}[], country: string = undefined, location: [number, number] = undefined): NSIItem[] {
        return tags.flatMap(tag => this.getSuggestionsForKV(type, tag.key, tag.value, country, location))
    }

    /**
     *
     * @param country: a string containing one or more country codes, separated by ";"
     * @param location: center point of the feature, should be [lon, lat]
     */
    public static getSuggestionsForKV(type: string, key: string, value: string, country: string = undefined, location: [number, number] = undefined): NSIItem[] {
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
