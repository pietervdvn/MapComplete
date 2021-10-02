import {Utils} from "../../Utils";


export interface WikidataResponse {

    id: string,
    labels: Map<string, string>,
    descriptions: Map<string, string>,
    claims: Map<string, Set<string>>,
    wikisites: Map<string, string>
    commons: string
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
        for (const claimId of entity.claims) {

            const claimsList: any[] = entity.claims[claimId]
            const values = new Set<string>()
            for (const claim of claimsList) {
                const value = claim.mainsnak.datavalue.value;
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

    /**
     * Loads a wikidata page
     * @returns the entity of the given value
     */
    public static async LoadWikidataEntry(value: string | number): Promise<WikidataResponse> {
        const wikidataUrl = "https://www.wikidata.org/wiki/"
        if (typeof value === "number") {
            value = "Q" + value
        }
        if (value.startsWith(wikidataUrl)) {
            value = value.substring(wikidataUrl.length)
        }
        if (value.startsWith("http")) {
            // Probably some random link in the image field - we skip it
            return undefined
        }
        if (!value.startsWith("Q")) {
            value = "Q" + value
        }
        const url = "https://www.wikidata.org/wiki/Special:EntityData/" + value + ".json";
        const response = await Utils.downloadJson(url)
        return Wikidata.ParseResponse(response.entities[value]);
    }

}