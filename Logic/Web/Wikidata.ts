import {Utils} from "../../Utils";
import {UIEventSource} from "../UIEventSource";


export interface WikidataResponse {

    id: string,
    labels: Map<string, string>,
    descriptions: Map<string, string>,
    claims: Map<string, Set<string>>,
    wikisites: Map<string, string>
    commons: string
}

export interface WikidataSearchoptions {
    lang?: "en" | string,
    maxCount?: 20 | number
}

/**
 * Utility functions around wikidata
 */
export default class Wikidata {

    private static ParseResponse(entity: any): WikidataResponse {
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

        const claims = new Map<string, Set<string>>();
        for (const claimId in entity.claims) {

            const claimsList: any[] = entity.claims[claimId]
            const values = new Set<string>()
            for (const claim of claimsList) {
                let value = claim.mainsnak?.datavalue?.value;
                if (value === undefined) {
                    continue;
                }
                if(value.id !== undefined){
                    value = value.id
                }
                values.add(value)
            }
            claims.set(claimId, values);
        }

        return {
            claims: claims,
            descriptions: descr,
            id: entity.id,
            labels: labels,
            wikisites: sitelinks,
            commons: commons
        }
    }

    private static readonly _cache = new Map<number, UIEventSource<{success: WikidataResponse} | {error: any}>>()
    public static LoadWikidataEntry(value: string | number): UIEventSource<{success: WikidataResponse} | {error: any}> {
        const key = this.ExtractKey(value)
        const cached = Wikidata._cache.get(key)
        if(cached !== undefined){
            return cached
        }
        const src = UIEventSource.FromPromiseWithErr(Wikidata.LoadWikidataEntryAsync(key))
        Wikidata._cache.set(key, src)
        return src;
    }
    
    public static async search(
            search: string,
            options?:WikidataSearchoptions,
            page = 1
        ): Promise<{
        id: string,
        label: string,
        description: string
    }[]> {
            const maxCount = options?.maxCount ?? 20
            let pageCount =  Math.min(maxCount,50)
            const start = page * pageCount - pageCount;
            const lang = (options?.lang ?? "en")
            const url =
                "https://www.wikidata.org/w/api.php?action=wbsearchentities&search=" +
                search +
                "&language=" +
                lang +
                "&limit="+pageCount+"&continue=" +
                start +
                "&format=json&uselang=" +
                lang +
                "&type=item&origin=*"+
            "&props=" ;// props= removes some unused values in the result
            const response = await Utils.downloadJson(url)
        
            const result : any[] = response.search
        
            if(result.length < pageCount){
                // No next page
                return result;
            }
            if(result.length < maxCount){
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
    options?:WikidataSearchoptions
) : Promise<WikidataResponse[]>
    {
        const maxCount = options.maxCount
        // We provide some padding to filter away invalid values
        options.maxCount = Math.ceil((options.maxCount ?? 20) * 1.5)
        const searchResults = await Wikidata.search(search, options)
        const maybeResponses =  await Promise.all(searchResults.map(async r => {
           try{
               return await Wikidata.LoadWikidataEntry(r.id).AsPromise()
            }catch(e){
               console.error(e)
               return undefined;
           }
        }))
        const responses = maybeResponses
            .map(r => <WikidataResponse> r["success"])
            .filter(wd => {
            if(wd === undefined){
                return false;
            }
            if(wd.claims.get("P31" /*Instance of*/)?.has("Q4167410"/* Wikimedia Disambiguation page*/)){
                return false;
            }
            return true;
        })
        responses.splice(maxCount, responses.length - maxCount)
        return responses   
    }
    
    private static ExtractKey(value: string | number) : number{
        if (typeof value === "number") {
           return value
        }
        const wikidataUrl = "https://www.wikidata.org/wiki/"
        if (value.startsWith(wikidataUrl)) {
            value = value.substring(wikidataUrl.length)
        }
        if (value.startsWith("http")) {
            // Probably some random link in the image field - we skip it
            return undefined
        }
        if (value.startsWith("Q")) {
            value = value.substring(1)
        }
        const n = Number(value)
        if(isNaN(n)){
            return undefined
        }
        return n;
    }

    
    /**
     * Loads a wikidata page
     * @returns the entity of the given value
     */
    public static async LoadWikidataEntryAsync(value: string | number): Promise<WikidataResponse> {
        const id = Wikidata.ExtractKey(value)
        if(id === undefined){
            console.warn("Could not extract a wikidata entry from", value)
            return undefined;
        }
        
        const url = "https://www.wikidata.org/wiki/Special:EntityData/Q" + id + ".json";
        const response = await Utils.downloadJson(url)
        return Wikidata.ParseResponse(response.entities["Q" + id])
    }

}