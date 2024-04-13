import Combine from "../Base/Combine"
import { InputElement } from "../Input/InputElement"
import { TextField } from "../Input/TextField"
import Translations from "../i18n/Translations"
import { ImmutableStore, Store, Stores, UIEventSource } from "../../Logic/UIEventSource"
import Wikidata, { WikidataResponse } from "../../Logic/Web/Wikidata"
import Locale from "../i18n/Locale"
import { VariableUiElement } from "../Base/VariableUIElement"
import WikidataPreviewBox from "./WikidataPreviewBox"
import Title from "../Base/Title"
import Svg from "../../Svg"
import Loading from "../Base/Loading"
import Table from "../Base/Table"
import SvelteUIElement from "../Base/SvelteUIElement"
import Search from "../../assets/svg/Search.svelte"

export default class WikidataSearchBox extends InputElement<string> {
    public static docs = new Combine([
        new Title("Helper arguments"),
        new Table(
            ["name", "doc"],
            [
                [
                    "key",
                    "the value of this tag will initialize search (default: name). This can be a ';'-separated list in which case every key will be inspected. The non-null value will be used as search",
                ],
                [
                    "options",
                    new Combine([
                        "A JSON-object of type `{ removePrefixes: string[], removePostfixes: string[] }`.",
                        new Table(
                            ["subarg", "doc"],
                            [
                                [
                                    "removePrefixes",
                                    "remove these snippets of text from the start of the passed string to search. This is either a list OR a hash of languages to a list. The individual strings are interpreted as case ignoring regexes",
                                ],
                                [
                                    "removePostfixes",
                                    "remove these snippets of text from the end of the passed string to search. This is either a list OR a hash of languages to a list. The individual strings are interpreted as case ignoring regexes.",
                                ],
                                [
                                    "instanceOf",
                                    "A list of Q-identifier which indicates that the search results _must_ be an entity of this type, e.g. [`Q5`](https://www.wikidata.org/wiki/Q5) for humans",
                                ],
                                [
                                    "notInstanceof",
                                    "A list of Q-identifiers which indicates that the search results _must not_ be an entity of this type, e.g. [`Q79007`](https://www.wikidata.org/wiki/Q79007) to filter away all streets from the search results",
                                ],
                            ]
                        ),
                    ]),
                ],
            ]
        ),
        new Title("Example usage"),
        `The following is the 'freeform'-part of a layer config which will trigger a search for the wikidata item corresponding with the name of the selected feature. It will also remove '-street', '-square', ... if found at the end of the name

\`\`\`json
"freeform": {
    "key": "name:etymology:wikidata",
    "type": "wikidata",
    "helperArgs": [
        "name",
        {
            "removePostfixes": {"en": [
                "street",
                "boulevard",
                "path",
                "square",
                "plaza",
            ],
             "nl": ["straat","plein","pad","weg",laan"],
             "fr":["route (de|de la|de l'| de le)"]
             },

            "#": "Remove streets and parks from the search results:"
             "notInstanceOf": ["Q79007","Q22698"]
        }

    ]
}
\`\`\`

Another example is to search for species and trees:

\`\`\`json
 "freeform": {
        "key": "species:wikidata",
        "type": "wikidata",
        "helperArgs": [
          "species",
          {
          "instanceOf": [10884, 16521]
        }]
      }
\`\`\`
`,
    ])
    private static readonly _searchCache = new Map<string, Promise<WikidataResponse[]>>()
    private readonly wikidataId: UIEventSource<string>
    private readonly searchText: UIEventSource<string>
    private readonly instanceOf?: number[]
    private readonly notInstanceOf?: number[]

    constructor(options?: {
        searchText?: UIEventSource<string>
        value?: UIEventSource<string>
        notInstanceOf?: number[]
        instanceOf?: number[]
    }) {
        super()
        this.searchText = options?.searchText
        this.wikidataId = options?.value ?? new UIEventSource<string>(undefined)
        this.instanceOf = options?.instanceOf
        this.notInstanceOf = options?.notInstanceOf
    }

    GetValue(): UIEventSource<string> {
        return this.wikidataId
    }

    IsValid(t: string): boolean {
        return t.startsWith("Q") && !isNaN(Number(t.substring(1)))
    }

    protected InnerConstructElement(): HTMLElement {
        const searchField = new TextField({
            placeholder: Translations.t.general.wikipedia.searchWikidata,
            value: this.searchText,
            inputStyle: "width: calc(100% - 0.5rem); border: 1px solid black",
        })
        const selectedWikidataId = this.wikidataId

        const tooShort = new ImmutableStore<{ success: WikidataResponse[] }>({ success: undefined })
        const searchResult: Store<{ success?: WikidataResponse[]; error?: any }> = searchField
            .GetValue()
            .bind((searchText) => {
                if (searchText.length < 3 && !searchText.match(/[qQ][0-9]+/)) {
                    return tooShort
                }
                const lang = Locale.language.data
                const key = lang + ":" + searchText
                let promise = WikidataSearchBox._searchCache.get(key)
                if (promise === undefined) {
                    promise = Wikidata.searchAndFetch(searchText, {
                        lang,
                        maxCount: 5,
                        notInstanceOf: this.notInstanceOf,
                        instanceOf: this.instanceOf,
                    })
                    WikidataSearchBox._searchCache.set(key, promise)
                }
                return Stores.FromPromiseWithErr(promise)
            })

        const previews = new VariableUiElement(
            searchResult.map(
                (searchResultsOrFail) => {
                    if (searchField.GetValue().data.length === 0) {
                        return Translations.t.general.wikipedia.doSearch
                    }

                    if (searchField.GetValue().data.length < 3) {
                        return Translations.t.general.wikipedia.searchToShort
                    }

                    if (searchResultsOrFail === undefined) {
                        return new Loading(Translations.t.general.loading)
                    }

                    if (searchResultsOrFail.error !== undefined) {
                        return new Combine([
                            Translations.t.general.wikipedia.failed.Clone().SetClass("alert"),
                            searchResultsOrFail.error,
                        ])
                    }

                    const searchResults = searchResultsOrFail.success
                    if (searchResults.length === 0) {
                        return Translations.t.general.wikipedia.noResults.Subs({
                            search: searchField.GetValue().data ?? "",
                        })
                    }

                    return new Combine(
                        searchResults.map((wikidataresponse) => {
                            const el = WikidataPreviewBox.WikidataResponsePreview(
                                wikidataresponse
                            ).SetClass(
                                "rounded-xl p-1 sm:p-2 md:p-3 m-px border-2 sm:border-4 transition-colors"
                            )
                            el.onClick(() => {
                                selectedWikidataId.setData(wikidataresponse.id)
                            })
                            selectedWikidataId.addCallbackAndRunD((selected) => {
                                if (selected === wikidataresponse.id) {
                                    el.SetClass("subtle-background border-attention")
                                } else {
                                    el.RemoveClass("subtle-background")
                                    el.RemoveClass("border-attention")
                                }
                            })
                            return el
                        })
                    ).SetClass("flex flex-col")
                },
                [searchField.GetValue()]
            )
        )

        return new Combine([
            new Title(Translations.t.general.wikipedia.searchWikidata, 3).SetClass("m-2"),
            new Combine([
                new SvelteUIElement(Search).SetClass("w-6"),
                searchField.SetClass("m-2 w-full"),
            ]).SetClass("flex"),
            previews,
        ])
            .SetClass("flex flex-col border-2 border-black rounded-xl m-2 p-2")
            .ConstructElement()
    }
}
