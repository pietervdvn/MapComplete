/**
 * Some usefull utility functions around the wikipedia API
 */
import {Utils} from "../../Utils";
import {UIEventSource} from "../UIEventSource";
import Wikidata from "./Wikidata";

export default class Wikipedia {

    /**
     * When getting a wikipedia page data result, some elements (e.g. navigation, infoboxes, ...) should be removed if 'removeInfoBoxes' is set.
     * We do this based on the classes. This set contains a blacklist of the classes to remove
     * @private
     */
    private static readonly classesToRemove = [
        "shortdescription",
        "sidebar",
        "infobox","infobox_v2",
        "noprint",
        "ambox",
        "mw-editsection",
        "mw-selflink",
        "hatnote" // Often redirects
    ]
    
    private static readonly idsToRemove = [
        "sjabloon_zie"
    ]

    private static readonly _cache = new Map<string, UIEventSource<{ success: string } | { error: any }>>()
    
    public static GetArticle(options: {
        pageName: string,
        language?: "en" | string}): UIEventSource<{ success: string } | { error: any }>{
        const key = (options.language ?? "en")+":"+options.pageName
        const cached = Wikipedia._cache.get(key)
        if(cached !== undefined){
            return cached
        }
        const v = UIEventSource.FromPromiseWithErr(Wikipedia.GetArticleAsync(options))
        Wikipedia._cache.set(key, v)
        return v;
    }
    
    public static async GetArticleAsync(options: {
        pageName: string,
        language?: "en" | string
    }): Promise<string> {

        const language = options.language ?? "en"
        const url = `https://${language}.wikipedia.org/w/api.php?action=parse&format=json&origin=*&prop=text&page=` + options.pageName
        const response = await Utils.downloadJson(url)
        const html = response["parse"]["text"]["*"];

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
            const toRemove = content.querySelector("#"+forbiddenId)
            toRemove?.parentElement?.removeChild(toRemove)
        }
        
        

        const links = Array.from(content.getElementsByTagName("a"))

        // Rewrite relative links to absolute links + open them in a new tab
        links.filter(link => link.getAttribute("href")?.startsWith("/") ?? false).
        forEach(link => {
            link.target = '_blank'
            // note: link.getAttribute("href") gets the textual value, link.href is the rewritten version which'll contain the host for relative paths
            link.href = `https://${language}.wikipedia.org${link.getAttribute("href")}`;
        })

        return content.innerHTML
    }

}