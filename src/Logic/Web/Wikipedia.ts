import { Utils } from "../../Utils"
import Wikidata, { WikidataResponse } from "./Wikidata"
import { Store, UIEventSource } from "../UIEventSource"

export interface FullWikipediaDetails {
    articleUrl?: string
    language?: string
    pagename?: string
    fullArticle?: string
    firstParagraph?: string
    restOfArticle?: string
    wikidata?: WikidataResponse
    title?: string
}

export default class Wikipedia {
    /**
     * When getting a wikipedia page data result, some elements (e.g. navigation, infoboxes, ...) should be removed if 'removeInfoBoxes' is set.
     * We do this based on the classes. This set contains a blacklist of the classes to remove
     * @private
     */
    private static readonly classesToRemove = [
        "shortdescription",
        "sidebar",
        "infobox",
        "infobox_v2",
        "noprint",
        "ambox",
        "mw-editsection",
        "mw-selflink",
        "mw-empty-elt",
        "hatnote", // Often redirects
    ]

    private static readonly idsToRemove = ["sjabloon_zie"]

    public static readonly neededUrls = ["*.wikipedia.org"]

    private static readonly _cache = new Map<string, Promise<string>>()
    private static _fullDetailsCache = new Map<string, Store<FullWikipediaDetails>>()
    public readonly backend: string

    constructor(options?: { language?: "en" | string } | { backend?: string }) {
        this.backend = Wikipedia.getBackendUrl(options ?? {})
    }

    /**
     * Tries to extract the language and article name from the given string
     *
     * Wikipedia.extractLanguageAndName("qsdf") // => undefined
     * Wikipedia.extractLanguageAndName("nl:Warandeputten") // => {language: "nl", pageName: "Warandeputten"}
     */
    public static extractLanguageAndName(input: string): { language: string; pageName: string } {
        const matched = input.match("([^:]+):(.*)")
        if (matched === undefined || matched === null) {
            return undefined
        }
        const [_, language, pageName] = matched
        return {
            language,
            pageName,
        }
    }

    /**
     * Fetch all useful information for the given entity.
     *
     */
    public static fetchArticleAndWikidata(
        wikidataOrPageId: string,
        preferedLanguage: string
    ): Store<FullWikipediaDetails> {
        const cachekey = preferedLanguage + wikidataOrPageId
        const cached = Wikipedia._fullDetailsCache.get(cachekey)
        if (cached) {
            return cached
        }
        const store = new UIEventSource<FullWikipediaDetails>({}, cachekey)
        Wikipedia._fullDetailsCache.set(cachekey, store)

        // Are we dealing with a wikidata item?
        const wikidataId = Wikidata.ExtractKey(wikidataOrPageId)
        if (!wikidataId) {
            // We are dealing with a wikipedia identifier, e.g. 'NL:articlename', 'https://nl.wikipedia.org/wiki/article', ...
            const { language, pageName } = Wikipedia.extractLanguageAndName(wikidataOrPageId)
            store.data.articleUrl = new Wikipedia({ language }).getPageUrl(pageName)
            store.data.language = language
            store.data.pagename = pageName
            store.data.title = pageName
        } else {
            // Jup, this is a wikidata item
            // Lets fetch the wikidata
            store.data.title = wikidataId
            Wikidata.LoadWikidataEntryAsync(wikidataId).then((wikidata) => {
                store.data.wikidata = wikidata
                store.ping()
                // With the wikidata, we can search for the appropriate wikipedia page
                const preferredLanguage = [
                    preferedLanguage,
                    "en",
                    Array.from(wikidata.wikisites.keys())[0],
                ]

                for (const language of preferredLanguage) {
                    const pagetitle = wikidata.wikisites.get(language)
                    if (pagetitle) {
                        store.data.articleUrl = new Wikipedia({ language }).getPageUrl(pagetitle)
                        store.data.pagename = pagetitle
                        store.data.language = language
                        store.data.title = pagetitle
                        store.ping()
                        break
                    }
                }
            })
        }

        // Now that the pageURL has been setup, we can focus on downloading the actual article
        // We setup a listener. As soon as the article-URL is know, we'll fetch the actual page
        // This url can either be set by the Wikidata-response or directly if we are dealing with a wikipedia-url
        store.addCallbackAndRun((data) => {
            if (data.language === undefined || data.pagename === undefined) {
                return
            }
            const wikipedia = new Wikipedia({ language: data.language })
            wikipedia.GetArticleHtml(data.pagename).then((article) => {
                article = Utils.purify(article)
                data.fullArticle = article
                const content = document.createElement("div")
                content.innerHTML = article
                const firstParagraph = content.getElementsByTagName("p").item(0)
                if (firstParagraph) {
                    data.firstParagraph = firstParagraph.innerHTML
                    content.removeChild(firstParagraph)
                }
                data.restOfArticle = content.innerHTML
                store.ping()
            })
            return true // unregister
        })

        return store
    }

    private static getBackendUrl(
        options: { language?: "en" | string } | { backend?: "en.wikipedia.org" | string }
    ): string {
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

    /**
     * Extracts the actual pagename; returns undefined if this came from a different wikimedia entry
     *
     * new Wikipedia({backend: "https://wiki.openstreetmap.org"}).extractPageName("https://wiki.openstreetmap.org/wiki/NL:Speelbos") // => "NL:Speelbos"
     * new Wikipedia().extractPageName("https://wiki.openstreetmap.org/wiki/NL:Speelbos") // => undefined
     */
    public extractPageName(input: string): string | undefined {
        if (!input.startsWith(this.backend)) {
            return undefined
        }
        input = input.substring(this.backend.length)

        const matched = input.match("/?wiki/(.+)")
        if (matched === undefined || matched === null) {
            return undefined
        }
        const [_, pageName] = matched
        return pageName
    }

    public getDataUrl(pageName: string): string {
        return (
            `${this.backend}/w/api.php?action=parse&format=json&origin=*&prop=text&page=` + pageName
        )
    }

    public getPageUrl(pageName: string): string {
        return `${this.backend}/wiki/${pageName}`
    }

    /**
     * Textual search of the specified wiki-instance. If searching Wikipedia, we recommend using wikidata.search instead
     * @param searchTerm
     */
    public async search(searchTerm: string): Promise<{ title: string; snippet: string }[]> {
        const url =
            this.backend +
            "/w/api.php?action=query&format=json&list=search&srsearch=" +
            encodeURIComponent(searchTerm)
        return (await Utils.downloadJson(url))["query"]["search"]
    }
    /**
     * Returns the innerHTML for the given article as string.
     * Some cleanup is applied to this.
     *
     * This method uses a static, local cache, so each article will be retrieved only once via the network
     */
    public GetArticleHtml(pageName: string): Promise<string> {
        const cacheKey = this.backend + "/" + pageName
        if (Wikipedia._cache.has(cacheKey)) {
            return Wikipedia._cache.get(cacheKey)
        }
        const promise = this.GetArticleUncachedAsync(pageName)
        Wikipedia._cache.set(cacheKey, promise)
        return promise
    }

    private async GetArticleUncachedAsync(pageName: string): Promise<string> {
        const response = await Utils.downloadJson(this.getDataUrl(pageName))
        if (response?.parse?.text === undefined) {
            return undefined
        }
        const html = Utils.purify(response["parse"]["text"]["*"])
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
        links
            .filter((link) => link.getAttribute("href")?.startsWith("/") ?? false)
            .forEach((link) => {
                link.target = "_blank"
                // note: link.getAttribute("href") gets the textual value, link.href is the rewritten version which'll contain the host for relative paths
                link.href = `${this.backend}${link.getAttribute("href")}`
            })

        return content.innerHTML
    }
}
