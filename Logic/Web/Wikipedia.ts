/**
 * Some usefull utility functions around the wikipedia API
 */
import {Utils} from "../../Utils";
import {UIEventSource} from "../UIEventSource";
import {WikipediaBoxOptions} from "../../UI/Wikipedia/WikipediaBox";

export default class Wikipedia {

    /**
     * When getting a wikipedia page data result, some elements (e.g. navigation, infoboxes, ...) should be removed if 'removeInfoBoxes' is set.
     * We do this based on the classes. This set contains a blacklist of the classes to remove
     * @private
     */
    private static readonly classesToRemove = [
        "shortdescription",
        "sidebar",
        "infobox", "infobox_v2",
        "noprint",
        "ambox",
        "mw-editsection",
        "mw-selflink",
        "mw-empty-elt",
        "hatnote" // Often redirects
    ]

    private static readonly idsToRemove = [
        "sjabloon_zie"
    ]

    private static readonly _cache = new Map<string, UIEventSource<{ success: string } | { error: any }>>()


    private readonly _backend: string;

    constructor(options?: ({ language?: "en" | string } | { backend?: string })) {
        this._backend = Wikipedia.getBackendUrl(options ?? {});
    }

    /**
     * Tries to extract the language and article name from the given string
     *
     * Wikipedia.extractLanguageAndName("qsdf") // => undefined
     * Wikipedia.extractLanguageAndName("nl:Warandeputten") // => {language: "nl", pageName: "Warandeputten"}
     */
    public static extractLanguageAndName(input: string): { language: string, pageName: string } {
        const matched = input.match("([^:]+):(.*)")
        if (matched === undefined || matched === null) {
            return undefined
        }
        const [_, language, pageName] = matched
        return {
            language, pageName
        }
    }

    /**
     * Extracts the actual pagename; returns undefined if this came from a different wikimedia entry
     * 
     * new Wikipedia({backend: "https://wiki.openstreetmap.org"}).extractPageName("https://wiki.openstreetmap.org/wiki/NL:Speelbos") // => "NL:Speelbos"
     * new Wikipedia().extractPageName("https://wiki.openstreetmap.org/wiki/NL:Speelbos") // => undefined
     */
    public extractPageName(input: string):string  | undefined{
        if(!input.startsWith(this._backend)){
            return undefined
        }
        input = input.substring(this._backend.length);
        
        const matched = input.match("/?wiki/\(.+\)")
        if (matched === undefined || matched === null) {
            return undefined
        }
        const [_, pageName] = matched
        return pageName
    }

    private static getBackendUrl(options: { language?: "en" | string } | { backend?: "en.wikipedia.org" | string }): string {
        let backend = "en.wikipedia.org"
        if (options["backend"]) {
            backend = options["backend"]
        } else if (options["language"]) {
            backend = `${options["language"] ?? "en"}.wikipedia.org`
        }
        if (!backend.startsWith("http")) {
            backend = "https://" + backend
        }
        return backend
    }

    public GetArticle(pageName: string, options: WikipediaBoxOptions): UIEventSource<{ success: string } | { error: any }> {
        const key = this._backend + ":" + pageName + ":" + (options.firstParagraphOnly ?? false)
        const cached = Wikipedia._cache.get(key)
        if (cached !== undefined) {
            return cached
        }
        const v = UIEventSource.FromPromiseWithErr(this.GetArticleAsync(pageName, options))
        Wikipedia._cache.set(key, v)
        return v;
    }

    public getDataUrl(pageName: string): string {
        return `${this._backend}/w/api.php?action=parse&format=json&origin=*&prop=text&page=` + pageName
    }

    public getPageUrl(pageName: string): string {
        return `${this._backend}/wiki/${pageName}`
    }

    /**
     * Textual search of the specified wiki-instance. If searching Wikipedia, we recommend using wikidata.search instead
     * @param searchTerm
     */
    public async search(searchTerm: string): Promise<{ title: string, snippet: string }[]> {
        const url = this._backend + "/w/api.php?action=query&format=json&list=search&srsearch=" + encodeURIComponent(searchTerm);
        return (await Utils.downloadJson(url))["query"]["search"];
    }

    /**
     * Searches via 'index.php' and scrapes the result.
     * This gives better results then via the API
     * @param searchTerm
     */
    public async searchViaIndex(searchTerm: string): Promise<{ title: string, snippet: string, url: string } []> {
        const url = `${this._backend}/w/index.php?search=${encodeURIComponent(searchTerm)}`
        const result = await Utils.downloadAdvanced(url);
        if(result["redirect"] ){
            // This is an exact match
            return [{
                title: this.extractPageName(result["redirect"]), 
                url: result["redirect"],
                snippet: ""
            }]
        }
        const el = document.createElement('html');
        el.innerHTML = result["content"].replace(/href="\//g, "href=\""+this._backend+"/");
        const searchResults = el.getElementsByClassName("mw-search-results")
        const individualResults = Array.from(searchResults[0]?.getElementsByClassName("mw-search-result") ?? [])
        return individualResults.map(result => {
            return {
                title: result.getElementsByClassName("mw-search-result-heading")[0].textContent,
                url: result.getElementsByTagName("a")[0].href,
                snippet: result.getElementsByClassName("searchresult")[0].textContent
            }
        })
    }

    public async GetArticleAsync(pageName: string, options:
        {
            firstParagraphOnly?: false | boolean
        }): Promise<string | undefined> {

        const response = await Utils.downloadJson(this.getDataUrl(pageName))
        if (response?.parse?.text === undefined) {
            return undefined
        }
        const html = response["parse"]["text"]["*"];
        if (html === undefined) {
            return undefined
        }
        const div = document.createElement("div")
        div.innerHTML = html
        const content = Array.from(div.children)[0]

        for (const forbiddenClass of Wikipedia.classesToRemove) {
            const toRemove = content.getElementsByClassName(forbiddenClass)
            for (const toRemoveElement of Array.from(toRemove)) {
                toRemoveElement.parentElement?.removeChild(toRemoveElement)
            }
        }

        for (const forbiddenId of Wikipedia.idsToRemove) {
            const toRemove = content.querySelector("#" + forbiddenId)
            toRemove?.parentElement?.removeChild(toRemove)
        }


        const links = Array.from(content.getElementsByTagName("a"))

        // Rewrite relative links to absolute links + open them in a new tab
        links.filter(link => link.getAttribute("href")?.startsWith("/") ?? false).forEach(link => {
            link.target = '_blank'
            // note: link.getAttribute("href") gets the textual value, link.href is the rewritten version which'll contain the host for relative paths
            link.href = `${this._backend}${link.getAttribute("href")}`;
        })

        if (options?.firstParagraphOnly) {
            return content.getElementsByTagName("p").item(0).innerHTML
        }

        return content.innerHTML
    }

}