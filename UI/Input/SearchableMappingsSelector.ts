import {UIElement} from "../UIElement";
import {InputElement} from "./InputElement";
import BaseUIElement from "../BaseUIElement";
import {Store, UIEventSource} from "../../Logic/UIEventSource";
import Translations from "../i18n/Translations";
import Locale from "../i18n/Locale";
import Combine from "../Base/Combine";
import {TextField} from "./TextField";
import Svg from "../../Svg";
import {VariableUiElement} from "../Base/VariableUIElement";


/**
 * A single 'pill' which can hide itself if the search criteria is not met
 */
class SelfHidingToggle extends UIElement implements InputElement<boolean> {
    private readonly _shown: BaseUIElement;
    public readonly _selected: UIEventSource<boolean>
    public readonly isShown: Store<boolean> = new UIEventSource<boolean>(true);
    public readonly forceSelected: UIEventSource<boolean>
    private readonly _squared:  boolean;
    public constructor(
        shown: string | BaseUIElement,
        mainTerm: Record<string, string>,
        search: Store<string>,
        options?: {
            searchTerms?: Record<string, string[]>,
            selected?: UIEventSource<boolean>,
            forceSelected?: UIEventSource<boolean>,
            squared?: boolean
        }
    ) {
        super();
        this._shown = Translations.W(shown);
        this._squared = options?.squared ?? false;
        const searchTerms: Record<string, string[]> = {};
        for (const lng in options?.searchTerms ?? []) {
            if (lng === "_context") {
                continue
            }
            searchTerms[lng] = options?.searchTerms[lng]?.map(SelfHidingToggle.clean)
        }
        for (const lng in mainTerm) {
            if (lng === "_context") {
                continue
            }
            const main = SelfHidingToggle.clean( mainTerm[lng])
            searchTerms[lng] = [main].concat(searchTerms[lng] ?? [])
        }
        const selected = this._selected = options?.selected ?? new UIEventSource<boolean>(false);
        const forceSelected = this.forceSelected = options?.forceSelected ?? new UIEventSource<boolean>(false)
        this.isShown = search.map(s => {
            if (s === undefined || s.length === 0) {
                return true;
            }
            if (selected.data && !forceSelected.data) {
                return true
            }
            s = s?.trim()?.toLowerCase()
            return searchTerms[Locale.language.data]?.some(t => t.indexOf(s) >= 0) ?? false;
        }, [selected, Locale.language])

        const self = this;
        this.isShown.addCallbackAndRun(shown => {
            if (shown) {
                self.RemoveClass("hidden")
            } else {
                self.SetClass("hidden")
            }
        })
    }
    
    private static clean(s: string) : string{
        return s?.trim()?.toLowerCase()?.replace(/[-]/, "")
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

        selected.addCallbackAndRun(selected => {
            if (selected) {
                el.SetClass("border-4")
                el.RemoveClass("border")
                el.SetStyle("margin: 0")
            } else {
                el.SetStyle("margin: 3px")
                el.SetClass("border")
                el.RemoveClass("border-4")
            }
        })

        const forcedSelection = this.forceSelected
        el.onClick(() => {
            if(forcedSelection.data){
                selected.setData(true)
            }else{
                selected.setData(!selected.data);
            }
        })

        if(!this._squared){
            el.SetClass("rounded-full")
        }
        return el.SetClass("border border-black p-1 px-4")
    }
}


/**
 * The searchable mappings selector is a selector which shows various pills from which one (or more) options can be chosen.
 * A searchfield can be used to filter the values
 */
export class SearchablePillsSelector<T> extends Combine implements InputElement<T[]> {
    private readonly selectedElements: UIEventSource<T[]>;

    public readonly someMatchFound: Store<boolean>;

    /**
     * 
     * @param values
     * @param options
     */
    constructor(
        values: { show: BaseUIElement, value: T, mainTerm: Record<string, string>, searchTerms?: Record<string, string[]> }[],
        options?: {
            mode?: "select-one" | "select-many",
            selectedElements?: UIEventSource<T[]>,
            searchValue?: UIEventSource<string>,
            onNoMatches?: BaseUIElement,
            onNoSearchMade?: BaseUIElement,
            selectIfSingle?: false | boolean,
            searchAreaClass?: string
        }) {

        const search = new TextField({value: options?.searchValue})

        const searchBar = new Combine([Svg.search_svg().SetClass("w-8 normal-background"), search.SetClass("w-full")])
            .SetClass("flex items-center border-2 border-black m-2")

        const searchValue = search.GetValue().map(s => s?.trim()?.toLowerCase())
        const selectedElements = options?.selectedElements ?? new UIEventSource<T[]>([]);
        const mode = options?.mode ?? "select-one";
        const onEmpty = options?.onNoMatches ?? Translations.t.general.noMatchingMapping

        const mappedValues: { show: SelfHidingToggle,  mainTerm: Record<string, string>, value: T }[] = values.map(v => {

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
                } else {
                    for (let i = 0; i < selectedElements.data.length; i++) {
                        const t = selectedElements.data[i]
                        if (t == v.value) {
                            selectedElements.data.splice(i, 1)
                            selectedElements.ping()
                            break;
                        }
                    }
                }
            })

            const toggle = new SelfHidingToggle(v.show, v.mainTerm, searchValue, {
                searchTerms: v.searchTerms,
                selected: vIsSelected,
                squared: mode === "select-many"
            })


            return {
                ...v,
                show: toggle
            };
        })

        let somethingShown: Store<boolean>
        if (options.selectIfSingle) {
            let forcedSelection : { value: T, show: SelfHidingToggle } = undefined
            somethingShown = searchValue.map(_ => {
                let totalShown = 0;
                let lastShownValue: { value: T, show: SelfHidingToggle }
                for (const mv of mappedValues) {
                    const valueIsShown = mv.show.isShown.data
                    if (valueIsShown) {
                        totalShown++;
                        lastShownValue = mv
                    }
                }
                if (totalShown == 1) {
                    if (selectedElements.data?.indexOf(lastShownValue.value) < 0) {
                        selectedElements.setData([lastShownValue.value])
                        lastShownValue.show.forceSelected.setData(true)
                        forcedSelection = lastShownValue
                    }
                } else if (forcedSelection != undefined) {
                    forcedSelection?.show?.forceSelected?.setData(false)
                    forcedSelection = undefined;
                    selectedElements.setData([])
                }

                return totalShown > 0
            }, mappedValues.map(mv => mv.show.GetValue()))
        } else {
            somethingShown = searchValue.map(_ => mappedValues.some(mv => mv.show.isShown.data), mappedValues.map(mv => mv.show.GetValue()))

        }

        super([
            searchBar,
            new VariableUiElement(Locale.language.map(lng => {
                if (options?.onNoSearchMade !== undefined && (searchValue.data === undefined || searchValue.data.length === 0)) {
                    return options?.onNoSearchMade
                }
                if (!somethingShown.data) {
                    return onEmpty
                }
                mappedValues.sort((a, b) => a.mainTerm[lng] < b.mainTerm[lng] ? -1 : 1)
                return new Combine(mappedValues.map(e => e.show))
                    .SetClass("flex flex-wrap w-full content-start")
                    .SetClass(options?.searchAreaClass ?? "")
            }, [somethingShown, searchValue]))

        ])
        this.selectedElements = selectedElements;
        this.someMatchFound = somethingShown;

    }

    public GetValue(): UIEventSource<T[]> {
        return this.selectedElements;
    }

    IsValid(t: T[]): boolean {
        return true;
    }


}

