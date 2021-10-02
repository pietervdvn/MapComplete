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
import Wikidata, {WikidataResponse} from "../Logic/Web/Wikidata";
import Locale from "./i18n/Locale";
import Toggle from "./Input/Toggle";

export default class WikipediaBox extends Toggle {


    constructor(wikidataId: string | UIEventSource<string>) {
        const wp = Translations.t.general.wikipedia;
        if (typeof wikidataId === "string") {
            wikidataId = new UIEventSource(wikidataId)
        }


        const wikibox = wikidataId
            .bind(id => {
                console.log("Wikidata is", id)
                if(id === undefined){
                    return undefined
                }
                console.log("Initing load WIkidataentry with id", id)
                return Wikidata.LoadWikidataEntry(id);
            })
            .map(maybewikidata => {
                if (maybewikidata === undefined) {
                    return new Loading(wp.loading.Clone())
                }
                if (maybewikidata["error"] !== undefined) {
                    return wp.failed.Clone().SetClass("alert p-4")
                }
                const wikidata = <WikidataResponse>maybewikidata["success"]
                console.log("Got wikidata response", wikidata)
                if (wikidata.wikisites.size === 0) {
                    return wp.noWikipediaPage.Clone()
                }

                const preferredLanguage = [Locale.language.data, "en", Array.from(wikidata.wikisites.keys())[0]]
                let language
                let pagetitle;
                let i = 0
                do {
                    language = preferredLanguage[i]
                    pagetitle = wikidata.wikisites.get(language)
                    i++;
                } while (pagetitle === undefined)
                return WikipediaBox.createContents(pagetitle, language)
            }, [Locale.language])


        const contents = new VariableUiElement(
            wikibox
        ).SetClass("overflow-auto normal-background rounded-lg")


        const mainContent = new Combine([
            new Combine([Svg.wikipedia_ui().SetStyle("width: 1.5rem").SetClass("mr-3"),
                new Title(Translations.t.general.wikipedia.wikipediaboxTitle.Clone(), 2)]).SetClass("flex"),
            contents]).SetClass("block rounded-xl subtle-background m-1 p-2 flex flex-col")
        super(
            mainContent,
            undefined,
            wikidataId.map(id => id !== undefined)
        )
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
                console.warn("Loading wikipage failed due to", htmlContent["error"])
                return wp.failed.Clone().SetClass("alert p-4")
            }

            return undefined
        })

        return new Combine([new VariableUiElement(contents).SetClass("block pl-6 pt-2")])
            .SetClass("block")
    }

}