import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization"
import { ImmutableStore, Store, UIEventSource } from "../../Logic/UIEventSource"
import BaseUIElement from "../BaseUIElement"
import SvelteUIElement from "../Base/SvelteUIElement"
import FediverseLink from "../Popup/FediverseLink.svelte"
import Wikidata, { WikidataResponse } from "../../Logic/Web/Wikidata"
import Wikipedia from "../../Logic/Web/Wikipedia"
import WikipediaPanel from "../Wikipedia/WikipediaPanel.svelte"
import { VariableUiElement } from "../Base/VariableUIElement"
import { Utils } from "../../Utils"
import { Translation } from "../i18n/Translation"
import { MapillaryLinkVis } from "../Popup/MapillaryLinkVis"
import SendEmail from "../Popup/SendEmail.svelte"
import DynLink from "../Base/DynLink.svelte"

export class WebAndCommunicationSpecialVisualisations {
    public static initList(): (SpecialVisualization & { group }) [] {
        return [

            {
                funcName: "fediverse_link",
                group: "web_and_communication",
                docs: "Converts a fediverse username or link into a clickable link",
                args: [
                    {
                        name: "key",
                        doc: "The attribute-name containing the link",
                        required: true
                    }
                ],

                constr(
                    state: SpecialVisualizationState,
                    tags: UIEventSource<Record<string, string>>,
                    argument: string[]
                ): BaseUIElement {
                    const key = argument[0]
                    return new SvelteUIElement(FediverseLink, { key, tags, state })
                }
            },
            {
                funcName: "wikipedia",
                group: "web_and_communication",
                docs: "A box showing the corresponding wikipedia article(s) - based on the **wikidata** tag.",
                args: [
                    {
                        name: "keyToShowWikipediaFor",
                        doc: "Use the wikidata entry from this key to show the wikipedia article for. Multiple keys can be given (separated by ';'), in which case the first matching value is used",
                        defaultValue: "wikidata;wikipedia"
                    }
                ],
                needsUrls: [...Wikidata.neededUrls, ...Wikipedia.neededUrls],

                example:
                    "`{wikipedia()}` is a basic example, `{wikipedia(name:etymology:wikidata)}` to show the wikipedia page of whom the feature was named after. Also remember that these can be styled, e.g. `{wikipedia():max-height: 10rem}` to limit the height",
                constr: (_, tagsSource, args) => {
                    const keys = args[0].split(";").map((k) => k.trim())
                    const wikiIds: Store<string[]> = tagsSource.map((tags) => {
                        const key = keys.find((k) => tags[k] !== undefined && tags[k] !== "")
                        return tags[key]?.split(";")?.map((id) => id.trim()) ?? []
                    })
                    return new SvelteUIElement(WikipediaPanel, {
                        wikiIds
                    })
                }
            },
            {
                funcName: "wikidata_label",
                group: "web_and_communication",

                docs: "Shows the label of the corresponding wikidata-item",
                args: [
                    {
                        name: "keyToShowWikidataFor",
                        doc: "Use the wikidata entry from this key to show the label",
                        defaultValue: "wikidata"
                    }
                ],
                needsUrls: Wikidata.neededUrls,
                example:
                    "`{wikidata_label()}` is a basic example, `{wikipedia(name:etymology:wikidata)}` to show the label itself",
                constr: (_, tagsSource, args) =>
                    new VariableUiElement(
                        tagsSource
                            .map((tags) => tags[args[0]])
                            .map((wikidata) => {
                                wikidata = Utils.NoEmpty(
                                    wikidata?.split(";")?.map((wd) => wd.trim()) ?? []
                                )[0]
                                const entry = Wikidata.LoadWikidataEntry(wikidata)
                                return new VariableUiElement(
                                    entry.map((e) => {
                                        if (e === undefined || e["success"] === undefined) {
                                            return wikidata
                                        }
                                        const response = <WikidataResponse>e["success"]
                                        return Translation.fromMap(response.labels)
                                    })
                                )
                            })
                    )
            },
            new MapillaryLinkVis(),
            {
                funcName: "send_email",
                group: "web_and_communication",
                docs: "Creates a `mailto`-link where some fields are already set and correctly escaped. The user will be promted to send the email",
                args: [
                    {
                        name: "to",
                        doc: "Who to send the email to?",
                        required: true
                    },
                    {
                        name: "subject",
                        doc: "The subject of the email",
                        required: true
                    },
                    {
                        name: "body",
                        doc: "The text in the email",
                        required: true
                    },

                    {
                        name: "button_text",
                        doc: "The text shown on the button in the UI",
                        required: true
                    }
                ],

                constr(__, tags, args) {
                    return new SvelteUIElement(SendEmail, { args, tags })
                }
            },
            {
                funcName: "link",
                group: "web_and_communication",
                docs: "Construct a link. By using the 'special' visualisation notation, translations should be easier",
                args: [
                    {
                        name: "text",
                        doc: "Text to be shown",
                        required: true
                    },
                    {
                        name: "href",
                        doc: "The URL to link to. Note that this will be URI-encoded before ",
                        required: true
                    },
                    {
                        name: "class",
                        doc: "CSS-classes to add to the element"
                    },
                    {
                        name: "download",
                        doc: "Expects a string which denotes the filename to download the contents of `href` into. If set, this link will act as a download-button."
                    },
                    {
                        name: "arialabel",
                        doc: "If set, this text will be used as aria-label"
                    },
                    {
                        name: "icon",
                        doc: "If set, show this icon next to the link. You might want to combine this with `class: button`"
                    }
                ],

                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    args: string[]
                ): SvelteUIElement {
                    let [text, href, classnames, download, ariaLabel, icon] = args
                    if (download === "") {
                        download = undefined
                    }
                    const newTab = download === undefined && !href.startsWith("#")
                    const textStore = tagSource.map((tags) => Utils.SubstituteKeys(text, tags))
                    const hrefStore = tagSource.map((tags) => Utils.SubstituteKeys(href, tags))
                    return new SvelteUIElement(DynLink, {
                        text: textStore,
                        href: hrefStore,
                        classnames: new ImmutableStore(classnames),
                        download: tagSource.map((tags) => Utils.SubstituteKeys(download, tags)),
                        ariaLabel: tagSource.map((tags) => Utils.SubstituteKeys(ariaLabel, tags)),
                        newTab: new ImmutableStore(newTab),
                        icon: tagSource.map((tags) => Utils.SubstituteKeys(icon, tags))
                    }).setSpan()
                }
            }
        ]
    }
}
