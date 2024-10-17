import Locale from "../../UI/i18n/Locale"
import { Utils } from "../../Utils"
import ThemeSearch from "./ThemeSearch"

export default class SearchUtils {


    /** Applies special search terms, such as 'studio', 'osmcha', ...
     * Returns 'false' if nothing is matched.
     * Doesn't return control flow if a match is found (navigates to another page in this case)
     */
    public static applySpecialSearch(searchTerm: string, ) {
        searchTerm = searchTerm.toLowerCase()
        if (!searchTerm) {
            return false
        }
        if (searchTerm === "personal") {
            window.location.href = ThemeSearch.createUrlFor({ id: "personal" }, undefined)
            return true

        }
        if (searchTerm === "bugs" || searchTerm === "issues") {
            window.location.href = "https://github.com/pietervdvn/MapComplete/issues"
            return true

        }
        if (searchTerm === "source") {
            window.location.href = "https://github.com/pietervdvn/MapComplete"
            return true

        }
        if (searchTerm === "docs") {
            window.location.href = "https://github.com/pietervdvn/MapComplete/tree/develop/Docs"
            return true

        }
        if (searchTerm === "osmcha" || searchTerm === "stats") {
            window.location.href = Utils.OsmChaLinkFor(7)
            return true

        }
        if (searchTerm === "studio") {
            window.location.href = "./studio.html"
            return true
        }
        return false

    }


    /**
     * Searches for the smallest distance in words; will split both the query and the terms
     *
     * SearchUtils.scoreKeywords("drinking water", {"en": ["A layer with drinking water points"]}, "en") // => 0
     * SearchUtils.scoreKeywords("waste", {"en": ["A layer with drinking water points"]}, "en") // => 2
     *
     */
    public static scoreKeywords(query: string, keywords: Record<string, string[]> | string[], language?: string): number {
        if(!keywords){
            return Infinity
        }
        language ??= Locale.language.data
        const queryParts = query.trim().split(" ").map(q => Utils.simplifyStringForSearch(q))
        let terms: string[]
        if (Array.isArray(keywords)) {
            terms = keywords
        } else {
            terms = (keywords[language] ?? []).concat(keywords["*"])
        }
        const termsAll = Utils.NoNullInplace(terms).flatMap(t => t.split(" "))

        let distanceSummed = 0
        for (let i = 0; i < queryParts.length; i++) {
            const q = queryParts[i]
            let minDistance: number = 99
            for (const term of termsAll) {
                const d = Utils.levenshteinDistance(q, Utils.simplifyStringForSearch(term))
                if (d < minDistance) {
                    minDistance = d
                }
            }
            distanceSummed += minDistance
        }
        return distanceSummed
    }
}
