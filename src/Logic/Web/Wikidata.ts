import { Utils } from "../../Utils"
import { Store, UIEventSource } from "../UIEventSource"
import * as wds from "wikidata-sdk"

export class WikidataResponse {
    public readonly id: string
    public readonly labels: Map<string, string>
    public readonly descriptions: Map<string, string>
    public readonly claims: Map<string, Set<string>>
    public readonly wikisites: Map<string, string>
    public readonly commons: string

    constructor(
        id: string,
        labels: Map<string, string>,
        descriptions: Map<string, string>,
        claims: Map<string, Set<string>>,
        wikisites: Map<string, string>,
        commons: string
    ) {
        this.id = id
        this.labels = labels
        this.descriptions = descriptions
        this.claims = claims
        this.wikisites = wikisites
        this.commons = commons
    }

    public static fromJson(entity: any): WikidataResponse {
        const labels = new Map<string, string>()
        for (const labelName in entity.labels) {
            // The labelname is the language code
            labels.set(labelName, entity.labels[labelName].value)
        }

        const descr = new Map<string, string>()
        for (const labelName in entity.descriptions) {
            // The labelname is the language code
            descr.set(labelName, entity.descriptions[labelName].value)
        }

        const sitelinks = new Map<string, string>()
        for (const labelName in entity.sitelinks) {
            // labelName is `${language}wiki`
            const language = labelName.substring(0, labelName.length - 4)
            const title = entity.sitelinks[labelName].title
            sitelinks.set(language, title)
        }

        const commons = sitelinks.get("commons")
        sitelinks.delete("commons")
        const claims = WikidataResponse.extractClaims(entity.claims)
        return new WikidataResponse(entity.id, labels, descr, claims, sitelinks, commons)
    }

    static extractClaims(claimsJson: any): Map<string, Set<string>> {
        const simplified = wds.simplify.claims(claimsJson, {
            timeConverter: "simple-day",
        })

        const claims = new Map<string, Set<string>>()
        for (const claimId in simplified) {
            const claimsList: any[] = simplified[claimId]
            claims.set(claimId, new Set(claimsList))
        }
        return claims
    }
}

export class WikidataLexeme {
    id: string
    lemma: Map<string, string>
    senses: Map<string, string>
    claims: Map<string, Set<string>>

    constructor(json) {
        this.id = json.id
        this.claims = WikidataResponse.extractClaims(json.claims)
        this.lemma = new Map<string, string>()
        for (const language in json.lemmas) {
            this.lemma.set(language, json.lemmas[language].value)
        }

        this.senses = new Map<string, string>()

        for (const sense of json.senses) {
            const glosses = sense.glosses
            for (const language in glosses) {
                let previousSenses = this.senses.get(language)
                if (previousSenses === undefined) {
                    previousSenses = ""
                } else {
                    previousSenses = previousSenses + "; "
                }
                this.senses.set(language, previousSenses + glosses[language].value ?? "")
            }
        }
    }

    asWikidataResponse() {
        return new WikidataResponse(
            this.id,
            this.lemma,
            this.senses,
            this.claims,
            new Map(),
            undefined
        )
    }
}

export interface WikidataSearchoptions {
    lang?: "en" | string
    maxCount?: 20 | number
}

export interface WikidataAdvancedSearchoptions extends WikidataSearchoptions {
    instanceOf?: number[]
    notInstanceOf?: number[]
}

/**
 * Utility functions around wikidata
 */
export default class Wikidata {
    public static readonly neededUrls = [
        "https://www.wikidata.org/",
        "https://wikidata.org/",
        "https://query.wikidata.org",
        "https://m.wikidata.org", // Important: a mobile browser will request m.wikidata.org instead of www.wikidata.org ; this URL needs to be listed for the CSP
    ]
    private static readonly _identifierPrefixes = ["Q", "L"].map((str) => str.toLowerCase())
    private static readonly _prefixesToRemove = [
        "https://www.wikidata.org/wiki/Lexeme:",
        "https://www.wikidata.org/wiki/",
        "http://www.wikidata.org/entity/",
        "Lexeme:",
    ].map((str) => str.toLowerCase())
    private static readonly _storeCache = new Map<
        string,
        Store<{ success: WikidataResponse } | { error: any }>
    >()

    /**
     * Same as LoadWikidataEntry, but wrapped into a UIEventSource
     * @param value
     * @constructor
     */
    public static LoadWikidataEntry(
        value: string | number
    ): Store<{ success: WikidataResponse } | { error: any }> {
        const key = this.ExtractKey(value)
        const cached = Wikidata._storeCache.get(key)
        if (cached) {
            return cached
        }
        const src = UIEventSource.FromPromiseWithErr(Wikidata.LoadWikidataEntryAsync(key))
        Wikidata._storeCache.set(key, src)
        return src
    }

    /**
     * Given a search text, searches for the relevant wikidata entries, excluding pages "outside of the main tree", e.g. disambiguation pages.
     * Optionally, an 'instance of' can be given to limit the scope, e.g. instanceOf:5 (humans) will only search for humans
     */
    public static async searchAdvanced(
        text: string,
        options?: WikidataAdvancedSearchoptions
    ): Promise<
        {
            id: string
            relevance?: number
            label: string
            description?: string
        }[]
    > {
        let instanceOf = ""
        if (options?.instanceOf !== undefined && options.instanceOf.length > 0) {
            const phrases = options.instanceOf.map((q) => `{ ?item wdt:P31/wdt:P279* wd:Q${q}. }`)
            instanceOf = "{" + phrases.join(" UNION ") + "}"
        }
        const forbidden = (options?.notInstanceOf ?? []).concat([17379835]) // blacklist 'wikimedia pages outside of the main knowledge tree', e.g. disambiguation pages
        const minusPhrases = forbidden.map((q) => `MINUS {?item wdt:P31/wdt:P279* wd:Q${q} .}`)
        const sparql = `SELECT * WHERE {
            SERVICE wikibase:mwapi {
                bd:serviceParam wikibase:api "EntitySearch" .
                bd:serviceParam wikibase:endpoint "www.wikidata.org" .
                bd:serviceParam mwapi:search "${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}" .
                bd:serviceParam mwapi:language "${options.lang}" .
                ?item wikibase:apiOutputItem mwapi:item .
                ?num wikibase:apiOrdinal true .
                bd:serviceParam wikibase:limit ${
                    Math.round(
                        (options?.maxCount ?? 20) * 1.5
                    ) /*Some padding for disambiguation pages */
                } .
                ?label wikibase:apiOutput mwapi:label .
                ?description wikibase:apiOutput "@description" .
            }
            ${instanceOf}
            ${minusPhrases.join("\n    ")}
        } ORDER BY ASC(?num) LIMIT ${options?.maxCount ?? 20}`
        const url = wds.sparqlQuery(sparql)

        const result = await Utils.downloadJson(url)
        /*The full uri of the wikidata-item*/

        return result.results.bindings.map(({ item, label, description, num }) => ({
            relevance: num?.value,
            id: item?.value,
            label: label?.value,
            description: description?.value,
        }))
    }

    public static async search(
        search: string,
        options?: WikidataSearchoptions,
        page = 1
    ): Promise<
        {
            id: string
            label: string
            description: string
        }[]
    > {
        const maxCount = options?.maxCount ?? 20
        let pageCount = Math.min(maxCount, 50)
        const start = page * pageCount - pageCount
        const lang = options?.lang ?? "en"
        const url =
            "https://www.wikidata.org/w/api.php?action=wbsearchentities&search=" +
            search +
            "&language=" +
            lang +
            "&limit=" +
            pageCount +
            "&continue=" +
            start +
            "&format=json&uselang=" +
            lang +
            "&type=item&origin=*" +
            "&props=" // props= removes some unused values in the result
        const response = await Utils.downloadJsonCached(url, 10000)

        const result: any[] = response.search

        if (result.length < pageCount) {
            // No next page
            return result
        }
        if (result.length < maxCount) {
            const newOptions = { ...options }
            newOptions.maxCount = maxCount - result.length
            result.push(...(await Wikidata.search(search, newOptions, page + 1)))
        }

        return result
    }

    public static async searchAndFetch(
        search: string,
        options?: WikidataAdvancedSearchoptions
    ): Promise<WikidataResponse[]> {
        // We provide some padding to filter away invalid values
        const searchResults = await Wikidata.searchAdvanced(search, options)
        const maybeResponses = await Promise.all(
            searchResults.map(async (r) => {
                try {
                    console.log("Loading ", r.id)
                    return await Wikidata.LoadWikidataEntry(r.id).AsPromise()
                } catch (e) {
                    console.error(e)
                    return undefined
                }
            })
        )
        return Utils.NoNull(maybeResponses.map((r) => <WikidataResponse>r["success"]))
    }

    /**
     * Gets the 'key' segment from a URL
     *
     * Wikidata.ExtractKey("https://www.wikidata.org/wiki/Lexeme:L614072") // => "L614072"
     * Wikidata.ExtractKey("http://www.wikidata.org/entity/Q55008046") // => "Q55008046"
     * Wikidata.ExtractKey("Q55008046") // => "Q55008046"
     * Wikidata.ExtractKey("A55008046") // => undefined
     * Wikidata.ExtractKey("Q55008046X") // => undefined
     */
    public static ExtractKey(value: string | number): string {
        if (typeof value === "number") {
            return "Q" + value
        }
        if (value === undefined) {
            console.error("ExtractKey: value is undefined")
            return undefined
        }
        value = value.trim().toLowerCase()

        for (const prefix of Wikidata._prefixesToRemove) {
            if (value.startsWith(prefix)) {
                value = value.substring(prefix.length)
            }
        }

        if (value.startsWith("http") && value === "") {
            // Probably some random link in the image field - we skip it
            return undefined
        }

        for (const identifierPrefix of Wikidata._identifierPrefixes) {
            if (value.startsWith(identifierPrefix)) {
                const trimmed = value.substring(identifierPrefix.length)
                if (trimmed === "") {
                    return undefined
                }
                const n = Number(trimmed)
                if (isNaN(n)) {
                    return undefined
                }
                return value.toUpperCase()
            }
        }

        if (value !== "" && !isNaN(Number(value))) {
            return "Q" + value
        }

        return undefined
    }

    /**
     * Converts 'Q123' into 123, returns undefined if invalid
     *
     * Wikidata.QIdToNumber("Q123") // => 123
     * Wikidata.QIdToNumber("  Q123  ") // => 123
     *  Wikidata.QIdToNumber("  X123  ") // => undefined
     * Wikidata.QIdToNumber("  Q123X  ") // => undefined
     * Wikidata.QIdToNumber(undefined) // => undefined
     * Wikidata.QIdToNumber(123) // => 123
     */
    public static QIdToNumber(q: string | number): number | undefined {
        if (q === undefined || q === null) {
            return
        }
        if (typeof q === "number") {
            return q
        }
        q = q.trim()
        if (!q.startsWith("Q")) {
            return
        }
        q = q.substr(1)
        const n = Number(q)
        if (isNaN(n)) {
            return
        }
        return n
    }

    public static IdToArticle(id: string) {
        if (id.startsWith("Q")) {
            return "https://wikidata.org/wiki/" + id
        }
        if (id.startsWith("L")) {
            return "https://wikidata.org/wiki/Lexeme:" + id
        }
        throw "Unknown id type: " + id
    }

    /**
     * Build a SPARQL-query, return the result
     *
     * @param keys: how variables are named. Every key not ending with 'Label' should appear in at least one statement
     * @param statements
     * @constructor
     */
    public static async Sparql<T>(
        keys: string[],
        statements: string[]
    ): Promise<(T & Record<string, { type: string; value: string }>)[]> {
        const query =
            "SELECT " +
            keys.map((k) => (k.startsWith("?") ? k : "?" + k)).join(" ") +
            "\n" +
            "WHERE\n" +
            "{\n" +
            statements.map((stmt) => (stmt.endsWith(".") ? stmt : stmt + ".")).join("\n") +
            '  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }\n' +
            "}"
        const url = wds.sparqlQuery(query)
        const result = await Utils.downloadJsonCached(url, 24 * 60 * 60 * 1000)
        return result.results.bindings
    }

    private static _cache = new Map<string, Promise<WikidataResponse>>()

    public static async LoadWikidataEntryAsync(value: string | number): Promise<WikidataResponse> {
        const key = "" + value
        const cached = Wikidata._cache.get(key)
        if (cached) {
            return cached
        }
        const uncached = Wikidata.LoadWikidataEntryUncachedAsync(value)
        Wikidata._cache.set(key, uncached)
        return uncached
    }

    /**
     * Loads a wikidata page
     * @returns the entity of the given value
     */
    private static async LoadWikidataEntryUncachedAsync(
        value: string | number
    ): Promise<WikidataResponse> {
        const id = Wikidata.ExtractKey(value)
        if (id === undefined) {
            console.warn("Could not extract a wikidata entry from", value)
            return undefined
        }

        const url = "https://www.wikidata.org/wiki/Special:EntityData/" + id + ".json"
        const entities = (await Utils.downloadJsonCached(url, 10000)).entities
        const firstKey = <string>Array.from(Object.keys(entities))[0] // Roundabout way to fetch the entity; it might have been a redirect
        const response = entities[firstKey]

        if (id.startsWith("L")) {
            // This is a lexeme:
            return new WikidataLexeme(response).asWikidataResponse()
        }

        return WikidataResponse.fromJson(response)
    }
}
