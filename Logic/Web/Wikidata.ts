import {Utils} from "../../Utils";
import {UIEventSource} from "../UIEventSource";
import * as wds from "wikibase-sdk"

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

        const sitelinks = new Map<string, string>();
        for (const labelName in entity.sitelinks) {
            // labelName is `${language}wiki`
            const language = labelName.substring(0, labelName.length - 4)
            const title = entity.sitelinks[labelName].title
            sitelinks.set(language, title)
        }

        const commons = sitelinks.get("commons")
        sitelinks.delete("commons")
        const claims = WikidataResponse.extractClaims(entity.claims);
        return new WikidataResponse(
            entity.id,
            labels,
            descr,
            claims,
            sitelinks,
            commons
        )

    }

    static extractClaims(claimsJson: any): Map<string, Set<string>> {
        
       const simplified = wds.simplify.claims(claimsJson, {
            timeConverter: 'simple-day'
        })
        
        const claims = new Map<string, Set<string>>();
        for (const claimId in simplified) {
            const claimsList: any[] = simplified[claimId]
            claims.set(claimId, new Set(claimsList));
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
                if(previousSenses === undefined){
                    previousSenses = ""
                }else{
                    previousSenses = previousSenses+"; "
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
        );
    }
}

export interface WikidataSearchoptions {
    lang?: "en" | string,
    maxCount?: 20 | number
}

/**
 * Utility functions around wikidata
 */
export default class Wikidata {

    private static readonly _identifierPrefixes = ["Q", "L"].map(str => str.toLowerCase())
    private static readonly _prefixesToRemove = ["https://www.wikidata.org/wiki/Lexeme:", "https://www.wikidata.org/wiki/", "Lexeme:"].map(str => str.toLowerCase())


    private static readonly _cache = new Map<string, UIEventSource<{ success: WikidataResponse } | { error: any }>>()

    public static LoadWikidataEntry(value: string | number): UIEventSource<{ success: WikidataResponse } | { error: any }> {
        const key = this.ExtractKey(value)
        const cached = Wikidata._cache.get(key)
        if (cached !== undefined) {
            return cached
        }
        const src = UIEventSource.FromPromiseWithErr(Wikidata.LoadWikidataEntryAsync(key))
        Wikidata._cache.set(key, src)
        return src;
    }

    public static async search(
        search: string,
        options?: WikidataSearchoptions,
        page = 1
    ): Promise<{
        id: string,
        label: string,
        description: string
    }[]> {
        const maxCount = options?.maxCount ?? 20
        let pageCount = Math.min(maxCount, 50)
        const start = page * pageCount - pageCount;
        const lang = (options?.lang ?? "en")
        const url =
            "https://www.wikidata.org/w/api.php?action=wbsearchentities&search=" +
            search +
            "&language=" +
            lang +
            "&limit=" + pageCount + "&continue=" +
            start +
            "&format=json&uselang=" +
            lang +
            "&type=item&origin=*" +
            "&props=";// props= removes some unused values in the result
        const response = await Utils.downloadJsonCached(url, 10000)

        const result: any[] = response.search

        if (result.length < pageCount) {
            // No next page
            return result;
        }
        if (result.length < maxCount) {
            const newOptions = {...options}
            newOptions.maxCount = maxCount - result.length
            result.push(...await Wikidata.search(search,
                newOptions,
                page + 1
            ))
        }

        return result;
    }

    
    public static async searchAndFetch(
        search: string,
        options?: WikidataSearchoptions
    ): Promise<WikidataResponse[]> {
        const maxCount = options.maxCount
        // We provide some padding to filter away invalid values
        options.maxCount = Math.ceil((options.maxCount ?? 20) * 1.5)
        const searchResults = await Wikidata.search(search, options)
        const maybeResponses = await Promise.all(searchResults.map(async r => {
            try {
                return await Wikidata.LoadWikidataEntry(r.id).AsPromise()
            } catch (e) {
                console.error(e)
                return undefined;
            }
        }))
        const responses = maybeResponses
            .map(r => <WikidataResponse>r["success"])
            .filter(wd => {
                if (wd === undefined) {
                    return false;
                }
                if (wd.claims.get("P31" /*Instance of*/)?.has("Q4167410"/* Wikimedia Disambiguation page*/)) {
                    return false;
                }
                return true;
            })
        responses.splice(maxCount, responses.length - maxCount)
        return responses
    }

    public static ExtractKey(value: string | number): string {
        if (typeof value === "number") {
            return "Q" + value
        }
        if (value === undefined) {
            console.error("ExtractKey: value is undefined")
            return undefined;
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
                const trimmed = value.substring(identifierPrefix.length);
                if(trimmed === ""){
                    return undefined
                }
                const n = Number(trimmed)
                if (isNaN(n)) {
                    return undefined
                }
                return value.toUpperCase();
            }
        }

        if (value !== "" && !isNaN(Number(value))) {
            return "Q" + value
        }

        return undefined;
    }

    public static IdToArticle(id: string){
        if(id.startsWith("Q")){
            return "https://wikidata.org/wiki/"+id
        }
        if(id.startsWith("L")){
            return "https://wikidata.org/wiki/Lexeme:"+id
        }
        throw "Unknown id type: "+id
    }

    /**
     * Loads a wikidata page
     * @returns the entity of the given value
     */
    public static async LoadWikidataEntryAsync(value: string | number): Promise<WikidataResponse> {
        const id = Wikidata.ExtractKey(value)
        if (id === undefined) {
            console.warn("Could not extract a wikidata entry from", value)
            throw "Could not extract a wikidata entry from " + value
        }

        const url = "https://www.wikidata.org/wiki/Special:EntityData/" + id + ".json";
        const entities = (await Utils.downloadJsonCached(url, 10000)).entities
        const firstKey = <string> Array.from(Object.keys(entities))[0] // Roundabout way to fetch the entity; it might have been a redirect
        const response = entities[firstKey]

        if (id.startsWith("L")) {
            // This is a lexeme:
            return new WikidataLexeme(response).asWikidataResponse()
        }

        return WikidataResponse.fromJson(response)
    }

}