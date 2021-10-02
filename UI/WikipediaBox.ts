import {UIEventSource} from "../Logic/UIEventSource";
import {VariableUiElement} from "./Base/VariableUIElement";
import Wikipedia from "../Logic/Web/Wikipedia";
import Loading from "./Base/Loading";
import {FixedUiElement} from "./Base/FixedUiElement";
import Combine from "./Base/Combine";
import BaseUIElement from "./BaseUIElement";
import Title from "./Base/Title";
import Translations from "./i18n/Translations";
import Svg from "../Svg";
import Wikidata from "../Logic/Web/Wikidata";
import Locale from "./i18n/Locale";

export default class WikipediaBox extends Combine {

    private static async ExtractWikiPages(wikidata): Promise<Map<string, string>> {
        return (await Wikidata.LoadWikidataEntry(wikidata)).wikisites
    }
    
    
    private static _cache = new Map()

    constructor(wikidataId: string | UIEventSource<string>) {
        const wp = Translations.t.general.wikipedia;
        if(typeof wikidataId === "string"){
            wikidataId = new UIEventSource(wikidataId)
        }
        
        const knownPages = new UIEventSource<{success:Map<string, string>}|{error:any}>(undefined)
            
        wikidataId.addCallbackAndRunD(wikidataId => {
            WikipediaBox.ExtractWikiPages(wikidataId).then(pages => {
                knownPages.setData({success:pages})
            }).catch(err=> {
                knownPages.setData({error: err})
            })
        })
        
        const cachedPages = new Map<string, BaseUIElement>()
        
        const contents = new VariableUiElement(
            knownPages.map(pages => {

                if (pages === undefined) {
                    return new Loading(wp.loading.Clone())
                }
                if (pages["error"] !== undefined) {
                    return wp.failed.Clone().SetClass("alert p-4")
                }
                const dict: Map<string, string> = pages["success"]

                const preferredLanguage = [Locale.language.data, "en", Array.from(dict.keys())[0]]
                let language
                let pagetitle;
                let i = 0
                do {
                    language = preferredLanguage[i]
                    pagetitle = dict.get(language)
                    i++;
                    if(i >= preferredLanguage.length){
                        return wp.noWikipediaPage.Clone()
                    }
                } while (pagetitle === undefined)
                
                if(cachedPages.has(language)){
                    return cachedPages.get(language)
                }

                const page = WikipediaBox.createContents(pagetitle, language);
                cachedPages.set(language, page)
                return page
            }, [Locale.language])
        ).SetClass("overflow-auto normal-background rounded-lg")


        super([
            new Combine([Svg.wikipedia_ui().SetStyle("width: 1.5rem").SetClass("mr-3"),
                new Title(Translations.t.general.wikipedia.wikipediaboxTitle.Clone(), 2)]).SetClass("flex"),
            contents])

        this
            .SetClass("block rounded-xl subtle-background m-1 p-2 flex flex-col")
    }

    /**
     * Returns the actual content in a scrollable way
     * @param pagename
     * @param language
     * @private
     */
    private static createContents(pagename: string, language: string): BaseUIElement {
        const htmlContent = Wikipedia.GetArticle({
            pageName: pagename,
            language: language
        })
        const wp = Translations.t.general.wikipedia
        const contents: UIEventSource<string | BaseUIElement> = htmlContent.map(htmlContent => {
            if (htmlContent === undefined) {
                // Still loading
                return new Loading(wp.loading.Clone())
            }
            if (htmlContent["success"] !== undefined) {
                return new FixedUiElement(htmlContent["success"]).SetClass("wikipedia-article")
            }
            if (htmlContent["error"]) {
                return wp.failed.Clone().SetClass("alert p-4")
            }

            return undefined
        })

        return new Combine([new VariableUiElement(contents).SetClass("block pl-6 pt-2")])
            .SetClass("block")
    }

}