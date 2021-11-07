import Combine from "../Base/Combine";
import {InputElement} from "../Input/InputElement";
import {TextField} from "../Input/TextField";
import Translations from "../i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";
import Wikidata, {WikidataResponse} from "../../Logic/Web/Wikidata";
import Locale from "../i18n/Locale";
import {VariableUiElement} from "../Base/VariableUIElement";
import WikidataPreviewBox from "./WikidataPreviewBox";
import Title from "../Base/Title";
import WikipediaBox from "./WikipediaBox";
import Svg from "../../Svg";

export default class WikidataSearchBox extends InputElement<string> {

    private static readonly _searchCache = new Map<string, Promise<WikidataResponse[]>>()
    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly wikidataId: UIEventSource<string>
    private readonly searchText: UIEventSource<string>

    constructor(options?: {
        searchText?: UIEventSource<string>,
        value?: UIEventSource<string>
    }) {
        super();
        this.searchText = options?.searchText
        this.wikidataId = options?.value ?? new UIEventSource<string>(undefined);
    }

    GetValue(): UIEventSource<string> {
        return this.wikidataId;
    }

    IsValid(t: string): boolean {
        return t.startsWith("Q") && !isNaN(Number(t.substring(1)));
    }

    protected InnerConstructElement(): HTMLElement {

        const searchField = new TextField({
            placeholder: Translations.t.general.wikipedia.searchWikidata,
            value: this.searchText,
            inputStyle: "width: calc(100% - 0.5rem); border: 1px solid black"

        })
        const selectedWikidataId = this.wikidataId

        const lastSearchResults = new UIEventSource<WikidataResponse[]>([])
        const searchFailMessage = new UIEventSource(undefined)
        searchField.GetValue().addCallbackAndRunD(searchText => {
            if (searchText.length < 3) {
                return;
            }
            searchFailMessage.setData(undefined)

            const lang = Locale.language.data
            const key = lang + ":" + searchText
            let promise = WikidataSearchBox._searchCache.get(key)
            if (promise === undefined) {
                promise = Wikidata.searchAndFetch(searchText, {
                        lang,
                        maxCount: 5
                    }
                )
                WikidataSearchBox._searchCache.set(key, promise)
            }

            lastSearchResults.WaitForPromise(promise, err => searchFailMessage.setData(err))

        })


        const previews = new VariableUiElement(lastSearchResults.map(searchResults => {
            if (searchFailMessage.data !== undefined) {
                return new Combine([Translations.t.general.wikipedia.failed.Clone().SetClass("alert"), searchFailMessage.data])
            }

            if (searchResults.length === 0) {
                return Translations.t.general.wikipedia.noResults.Subs({search: searchField.GetValue().data ?? ""})
            }

            if (searchResults.length === 0) {
                return Translations.t.general.wikipedia.doSearch
            }

            return new Combine(searchResults.map(wikidataresponse => {
                const el = WikidataPreviewBox.WikidataResponsePreview(wikidataresponse).SetClass("rounded-xl p-1 sm:p-2 md:p-3 m-px border-2 sm:border-4 transition-colors")
                el.onClick(() => {
                    selectedWikidataId.setData(wikidataresponse.id)
                })
                selectedWikidataId.addCallbackAndRunD(selected => {
                    if (selected === wikidataresponse.id) {
                        el.SetClass("subtle-background border-attention")
                    } else {
                        el.RemoveClass("subtle-background")
                        el.RemoveClass("border-attention")
                    }
                })
                return el;

            })).SetClass("flex flex-col")

        }, [searchFailMessage]))

        const full = new Combine([
            new Title(Translations.t.general.wikipedia.searchWikidata, 3).SetClass("m-2"),
            new Combine([
                Svg.search_ui().SetStyle("width: 1.5rem"),
                searchField.SetClass("m-2 w-full")]).SetClass("flex"),
            previews
        ]).SetClass("flex flex-col border-2 border-black rounded-xl m-2 p-2")

        return new Combine([
            new VariableUiElement(selectedWikidataId.map(wid => {
                if (wid === undefined) {
                    return undefined
                }
                return new WikipediaBox(wid.split(";"));
            })).SetStyle("max-height:12.5rem"),
            full
        ]).ConstructElement();
    }

}