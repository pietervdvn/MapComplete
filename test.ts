import * as shops from "./assets/generated/layers/shops.json"
import Combine from "./UI/Base/Combine";
import Img from "./UI/Base/Img";
import BaseUIElement from "./UI/BaseUIElement";
import Svg from "./Svg";
import {TextField} from "./UI/Input/TextField";
import {Store, UIEventSource} from "./Logic/UIEventSource";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import Locale from "./UI/i18n/Locale";
import LanguagePicker from "./UI/LanguagePicker";
import {InputElement} from "./UI/Input/InputElement";
import {UIElement} from "./UI/UIElement";
import Translations from "./UI/i18n/Translations";
import TagRenderingConfig, {Mapping} from "./Models/ThemeConfig/TagRenderingConfig";
import {MappingConfigJson} from "./Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {TagsFilter} from "./Logic/Tags/TagsFilter";

const mappingsRaw: MappingConfigJson[] = <any>shops.tagRenderings.find(tr => tr.id == "shop_types").mappings
const mappings = mappingsRaw.map((m, i) => TagRenderingConfig.ExtractMapping(m, i, "test", "test"))


export class SelfHidingToggle extends UIElement implements InputElement<boolean> {
    private readonly _shown: BaseUIElement;
    private readonly _searchTerms: Record<string, string[]>;
    private readonly _search: Store<string>;

    private readonly _selected: UIEventSource<boolean>

    public constructor(
        shown: string | BaseUIElement,
        mainTerm: Record<string, string>,
        search: Store<string>,
        searchTerms?: Record<string, string[]>,
        selected: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    ) {
        super();
        this._shown = Translations.W(shown);
        this._search = search;
        this._searchTerms = {};
        for (const lng in searchTerms ?? []) {
            if (lng === "_context") {
                continue
            }
            this._searchTerms[lng] = searchTerms[lng].map(t => t.trim().toLowerCase())
        }
        for (const lng in mainTerm) {
            if (lng === "_context") {
                continue
            }
            this._searchTerms[lng] = [mainTerm[lng]].concat(this._searchTerms[lng] ?? [])
        }
        this._selected = selected;
    }


    GetValue(): UIEventSource<boolean> {
        return this._selected
    }

    IsValid(t: boolean): boolean {
        return true;
    }

    protected InnerRender(): string | BaseUIElement {
        let el: BaseUIElement = this._shown;
        const selected = this._selected;
        const search = this._search;
        const terms = this._searchTerms;
        const applySearch = () => {
            const s = search.data?.trim()?.toLowerCase()
            if (s === undefined || s.length === 0 || selected.data) {
                el.RemoveClass("hidden")
                return;
            }

            if (terms[Locale.language.data].some(t => t.toLowerCase().indexOf(s) >= 0)) {
                el.RemoveClass("hidden");
                return;
            }

            el.SetClass("hidden")
        }
        search.addCallbackAndRun(_ => {
            applySearch()
        })
        Locale.language.addCallback(_ => {
            applySearch()
        })

        selected.addCallbackAndRun(selected => {
            if (selected) {
                el.SetClass("border-4")
                el.RemoveClass("border")
                el.SetStyle("margin: calc( 0.25rem )")
            } else {
                el.SetStyle("margin: calc( 0.25rem + 3px )")
                el.SetClass("border")
                el.RemoveClass("border-4")
            }
            applySearch()
        })

        el.onClick(() => selected.setData(!selected.data))

        return el.SetClass("border border-black rounded-full p-1 px-4")
    }
}


class SearchablePresets<T> extends Combine implements InputElement<T[]> {
    private selectedElements: UIEventSource<T[]>;

    constructor(
        values: { show: BaseUIElement, value: T, mainTerm: Record<string, string>, searchTerms?: Record<string, string[]> }[],
        mode: "select-one" | "select-many",
        selectedElements: UIEventSource<T[]> = new UIEventSource<T[]>([])) {

        const search = new TextField({})

        const searchBar = new Combine([Svg.search_svg().SetClass("w-8"), search.SetClass("mr-4 w-full")])
            .SetClass("flex rounded-full border-2 border-black items-center my-2 w-1/2")

        const searchValue = search.GetValue().map(s => s?.trim()?.toLowerCase())


        values = values.map(v => {

            const vIsSelected = new UIEventSource(false);

            selectedElements.addCallbackAndRunD(selectedElements => {
                vIsSelected.setData(selectedElements.some(t => t === v.value))
            })

            vIsSelected.addCallback(selected => {
                if (selected) {
                    if (mode === "select-one") {
                        selectedElements.setData([v.value])
                    } else if (!selectedElements.data.some(t => t === v.value)) {
                        selectedElements.data.push(v.value);
                        selectedElements.ping()
                    }
                }else{
                    for (let i = 0; i < selectedElements.data.length; i++) {
                        const t = selectedElements.data[i]
                        if(t == v.value){
                            selectedElements.data.splice(i, 1)
                            selectedElements.ping()
                            break;
                        }
                    }
                }
            })

            return {
                ...v,
                show: new SelfHidingToggle(v.show, v.mainTerm, searchValue, v.searchTerms, vIsSelected)
            };
        })

        super([
            searchBar,
            new VariableUiElement(Locale.language.map(lng => {
                values.sort((a, b) => a.mainTerm[lng] < b.mainTerm[lng] ? -1 : 1)
                return new Combine(values.map(e => e.show))
                    .SetClass("flex flex-wrap w-full")
            }))

        ])
        this.selectedElements = selectedElements;

    }

    public GetValue(): UIEventSource<T[]> {
        return this.selectedElements;
    }

    IsValid(t: T[]): boolean {
        return true;
    }


}


function fromMapping(m: Mapping): { show: BaseUIElement, value: TagsFilter, mainTerm: Record<string, string>, searchTerms?: Record<string, string[]> } {
    const el: BaseUIElement = m.then
    let icon: BaseUIElement
    if (m.icon !== undefined) {
        icon = new Img(m.icon).SetClass("h-8 w-8 pr-2")
    } else {
        icon = new FixedUiElement("").SetClass("h-8 w-1")
    }
    const show = new Combine([
        icon,
        el.SetClass("block-ruby")
    ]).SetClass("flex items-center")

    return {show, mainTerm: m.then.translations, searchTerms: m.searchTerms, value: m.if};

}

const sp = new SearchablePresets(
    mappings.map(m => fromMapping(m)),
    "select-one"
)

sp.AttachTo("maindiv")

const lp = new LanguagePicker(["en", "nl"], "")

new Combine([
    new VariableUiElement(sp.GetValue().map(tf => new FixedUiElement("Selected tags: " + tf.map(tf => tf.asHumanString(false, false, {})).join(", ")))),
    lp
]).SetClass("flex flex-col")
    .AttachTo("extradiv")