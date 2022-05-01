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
import {Paragraph} from "../Base/Paragraph";

export default class WikipediaBox extends Combine {

    public static configuration = {
        onlyFirstParagaph: false,
        addHeader: false
    }

    constructor(wikidataIds: string[]) {

        const mainContents = []

        const pages = wikidataIds.map(entry => WikipediaBox.createLinkedContent(entry.trim()))
        if (wikidataIds.length == 1) {
            const page = pages[0]
            mainContents.push(
                new Combine([
                    new Combine([
                        Svg.wikipedia_ui().SetStyle("width: 1.5rem").SetClass("inline-block mr-3"),
                        page.titleElement]).SetClass("flex"),
                    page.linkElement
                ]).SetClass("flex justify-between align-middle"),
            )
            mainContents.push(page.contents.SetClass("overflow-auto normal-background rounded-lg"))
        } else if (wikidataIds.length > 1) {

            const tabbed = new TabbedComponent(
                pages.map(page => {
                    const contents = page.contents.SetClass("overflow-auto normal-background rounded-lg block").SetStyle("max-height: inherit; height: inherit; padding-bottom: 3.3rem")
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
                    leftOfHeader: Svg.wikipedia_svg().SetStyle("width: 1.5rem; align-self: center;").SetClass("mr-4"),
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

    private static createLinkedContent(entry: string): {
        titleElement: BaseUIElement,
        contents: BaseUIElement,
        linkElement: BaseUIElement
    } {
        if (entry.match("[qQ][0-9]+")) {
            return WikipediaBox.createWikidatabox(entry)
        } else {
            console.log("Creating wikipedia box for ", entry)
            return WikipediaBox.createWikipediabox(entry)
        }
    }

    /**
     * Given a '<language>:<article-name>'-string, constructs the wikipedia article
     * @param wikipediaArticle
     * @private
     */
    private static createWikipediabox(wikipediaArticle: string): {
        titleElement: BaseUIElement,
        contents: BaseUIElement,
        linkElement: BaseUIElement
    } {
        const wp = Translations.t.general.wikipedia;

        const article = Wikipedia.extractLanguageAndName(wikipediaArticle)
        if (article === undefined) {
            return {
                titleElement: undefined,
                contents: wp.noWikipediaPage,
                linkElement: undefined
            }
        }
        const url = Wikipedia.getPageUrl(article) //  `https://${language}.wikipedia.org/wiki/${pagetitle}`
        const linkElement = new Link(Svg.pop_out_svg().SetStyle("width: 1.2rem").SetClass("block  "), url, true) .SetClass("flex items-center enable-links")

        return {
            titleElement: new Title(article.pageName, 3),
            contents: WikipediaBox.createContents(article.pageName, article.language),
            linkElement
        }
    }

    /**
     * Given a `Q1234`, constructs a wikipedia box or wikidata box
     */
    private static createWikidatabox(wikidataId: string): {
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
                    if (wikidata === undefined) {
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
                    const [_, wd] = <[string, WikidataResponse]>status
                    return new Combine([
                        WikidataPreviewBox.WikidataResponsePreview(wd),
                        wp.noWikipediaPage.Clone().SetClass("subtle")]).SetClass("flex flex-col p-4")
                }

                const [pagetitle, language, wd] = <[string, string, WikidataResponse]>status
                const quickFacts = WikidataPreviewBox.QuickFacts(wd);
                return WikipediaBox.createContents(pagetitle, language, quickFacts)

            })
        )

        const titleElement = new VariableUiElement(wikiLink.map(state => {
            if (typeof state !== "string") {
                const [pagetitle, _] = state
                if (pagetitle === "no page") {
                    const wd = <WikidataResponse>state[1]
                    return new Title(Translation.fromMap(wd.labels), 3)
                }
                return new Title(pagetitle, 3)
            }
            return new Link(new Title(wikidataId, 3), "https://www.wikidata.org/wiki/" + wikidataId, true)

        }))

        const linkElement = new VariableUiElement(wikiLink.map(state => {
            if (typeof state !== "string") {
                const [pagetitle, language] = state
                if (pagetitle === "no page") {
                    const wd = <WikidataResponse>state[1]
                    return new Link(Svg.pop_out_svg().SetStyle("width: 1.2rem").SetClass("block  "),
                        "https://www.wikidata.org/wiki/" + wd.id
                        , true)
                }

                const url = `https://${language}.wikipedia.org/wiki/${pagetitle}`
                return new Link(Svg.pop_out_svg().SetStyle("width: 1.2rem").SetClass("block  "), url, true)
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
     */
    private static createContents(pagename: string, language: string, topBar?: BaseUIElement): BaseUIElement {
        const wpOptions = {
            pageName: pagename,
            language: language,
            firstParagraphOnly: WikipediaBox.configuration.onlyFirstParagaph
        }
        const htmlContent = Wikipedia.GetArticle(wpOptions)
        const wp = Translations.t.general.wikipedia
        const contents: UIEventSource<string | BaseUIElement> = htmlContent.map(htmlContent => {
            if (htmlContent === undefined) {
                // Still loading
                return new Loading(wp.loading.Clone())
            }
            if (htmlContent["success"] !== undefined) {
                let content: BaseUIElement = new FixedUiElement(htmlContent["success"]);
                if (WikipediaBox.configuration.addHeader) {
                    content = new Combine(
                        [
                            new Paragraph(
                                new Link(wp.fromWikipedia, Wikipedia.getPageUrl(wpOptions), true),
                            ),
                            new Paragraph(
                                content
                            )
                        ]
                    )
                }
                return content.SetClass("wikipedia-article")
            }
            if (htmlContent["error"]) {
                console.warn("Loading wikipage failed due to", htmlContent["error"])
                return wp.failed.Clone().SetClass("alert p-4")
            }

            return undefined
        })

        return new Combine([
            topBar?.SetClass("border-2 border-grey rounded-lg m-1 mb-0"),
            new VariableUiElement(contents)
                .SetClass("block pl-6 pt-2")])
    }

}