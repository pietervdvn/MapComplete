import BaseUIElement from "../BaseUIElement";
import Locale from "../i18n/Locale";
import {VariableUiElement} from "../Base/VariableUIElement";
import {Translation} from "../i18n/Translation";
import Svg from "../../Svg";
import Combine from "../Base/Combine";
import Title from "../Base/Title";
import Wikipedia from "../../Logic/Web/Wikipedia";
import Wikidata, {WikidataResponse} from "../../Logic/Web/Wikidata";
import {TabbedComponent} from "../Base/TabbedComponent";
import {UIEventSource} from "../../Logic/UIEventSource";
import Loading from "../Base/Loading";
import {FixedUiElement} from "../Base/FixedUiElement";
import Translations from "../i18n/Translations";
import Link from "../Base/Link";
import WikidataPreviewBox from "./WikidataPreviewBox";

export default class WikipediaBox extends Combine {


    constructor(wikidataIds: string[]) {

        const mainContents = []

        const pages = wikidataIds.map(wdId => WikipediaBox.createLinkedContent(wdId.trim()))
        if (wikidataIds.length == 1) {
            const page = pages[0]
            mainContents.push(
                new Combine([
                    new Combine([Svg.wikipedia_ui()
                        .SetStyle("width: 1.5rem").SetClass("inline-block mr-3"), page.titleElement])
                        .SetClass("flex"),
                    page.linkElement
                ]).SetClass("flex justify-between align-middle"),
            )
            mainContents.push(page.contents)
        } else if (wikidataIds.length > 1) {

            const tabbed = new TabbedComponent(
                pages.map(page => {
                    const contents = page.contents.SetClass("block").SetStyle("max-height: inherit; height: inherit; padding-bottom: 3.3rem")
                    return {
                        header: page.titleElement.SetClass("pl-2 pr-2"),
                        content: new Combine([
                            page.linkElement
                                .SetStyle("top: 2rem; right: 2.5rem;")
                                .SetClass("absolute subtle-background rounded-full p-3 opacity-50 hover:opacity-100 transition-opacity"),
                            contents
                        ]).SetStyle("max-height: inherit; height: inherit").SetClass("relative")
                    }

                }),
                0,
                {
                    leftOfHeader: Svg.wikipedia_ui().SetStyle("width: 1.5rem; align-self: center;").SetClass("mr-4"),
                    styleHeader: header => header.SetClass("subtle-background").SetStyle("height: 3.3rem")
                }
            )
            tabbed.SetStyle("height: inherit; max-height: inherit; overflow: hidden")
            mainContents.push(tabbed)

        }


        super(mainContents)


        this.SetClass("block rounded-xl subtle-background m-1 p-2 flex flex-col")
            .SetStyle("max-height: inherit")
    }

    private static createLinkedContent(wikidataId: string): {
        titleElement: BaseUIElement,
        contents: BaseUIElement,
        linkElement: BaseUIElement
    } {

        const wp = Translations.t.general.wikipedia;

        const wikiLink: UIEventSource<[string, string, WikidataResponse] | "loading" | "failed" | ["no page", WikidataResponse]> =
            Wikidata.LoadWikidataEntry(wikidataId)
                .map(maybewikidata => {
                    if (maybewikidata === undefined) {
                        return "loading"
                    }
                    if (maybewikidata["error"] !== undefined) {
                        return "failed"

                    }
                    const wikidata = <WikidataResponse>maybewikidata["success"]
                    if(wikidata === undefined){
                        return "failed"
                    }
                    if (wikidata.wikisites.size === 0) {
                        return ["no page", wikidata]
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
                    return [pagetitle, language, wikidata]
                }, [Locale.language])


        const contents = new VariableUiElement(
            wikiLink.map(status => {
                if (status === "loading") {
                    return new Loading(wp.loading.Clone()).SetClass("pl-6 pt-2")
                }

                if (status === "failed") {
                    return wp.failed.Clone().SetClass("alert p-4")
                }
                if (status[0] == "no page") {
                    const [_, wd] = <[string, WikidataResponse]> status
                    return new Combine([
                        WikidataPreviewBox.WikidataResponsePreview(wd),
                        wp.noWikipediaPage.Clone().SetClass("subtle")]).SetClass("flex flex-col p-4")
                }

                const [pagetitle, language, wd] = <[string, string, WikidataResponse]> status
                return WikipediaBox.createContents(pagetitle, language, wd)

            })
        ).SetClass("overflow-auto normal-background rounded-lg")


        const titleElement = new VariableUiElement(wikiLink.map(state => {
            if (typeof state !== "string") {
                const [pagetitle, _] = state
                if(pagetitle === "no page"){
                    const wd = <WikidataResponse> state[1]
                    return new Title( Translation.fromMap(wd.labels),3)
                }
                return new Title(pagetitle, 3)
            }
            //return new Title(Translations.t.general.wikipedia.wikipediaboxTitle.Clone(), 2)
            return new Title(wikidataId,3)

        }))

        const linkElement = new VariableUiElement(wikiLink.map(state => {
            if (typeof state !== "string") {
                const [pagetitle, language] = state
                if(pagetitle === "no page"){
                    const wd = <WikidataResponse> state[1]
                    return new Link(Svg.pop_out_ui().SetStyle("width: 1.2rem").SetClass("block  "), 
                        "https://www.wikidata.org/wiki/"+wd.id
                        , true)
                }
                
                const url = `https://${language}.wikipedia.org/wiki/${pagetitle}`
                return new Link(Svg.pop_out_ui().SetStyle("width: 1.2rem").SetClass("block  "), url, true)
            }
            return undefined
        }))
            .SetClass("flex items-center enable-links")

        return {
            contents: contents,
            linkElement: linkElement,
            titleElement: titleElement
        }
    }


    /**
     * Returns the actual content in a scrollable way
     * @param pagename
     * @param language
     * @private
     */
    private static createContents(pagename: string, language: string, wikidata: WikidataResponse): BaseUIElement {
        const htmlContent = Wikipedia.GetArticle({
            pageName: pagename,
            language: language
        })
        const wp = Translations.t.general.wikipedia
        const quickFacts = WikidataPreviewBox.QuickFacts(wikidata);
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

        return new Combine([
            quickFacts?.SetClass("border-2 border-grey rounded-lg m-1 mb-0"),
            new VariableUiElement(contents)
            .SetClass("block pl-6 pt-2")])
    }

}