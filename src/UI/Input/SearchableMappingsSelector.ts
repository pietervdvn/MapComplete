import { UIElement } from "../UIElement"
import { InputElement } from "./InputElement"
import BaseUIElement from "../BaseUIElement"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import Translations from "../i18n/Translations"
import Locale from "../i18n/Locale"
import Combine from "../Base/Combine"
import { TextField } from "./TextField"
import Svg from "../../Svg"
import { VariableUiElement } from "../Base/VariableUIElement"

/**
 * A single 'pill' which can hide itself if the search criteria is not met
 */
class SelfHidingToggle extends UIElement implements InputElement<boolean> {
    public readonly _selected: UIEventSource<boolean>
    public readonly isShown: Store<boolean> = new UIEventSource<boolean>(true)
    public readonly matchesSearchCriteria: Store<boolean>
    public readonly forceSelected: UIEventSource<boolean>
    private readonly _shown: BaseUIElement
    private readonly _squared: boolean

    public constructor(
        shown: string | BaseUIElement,
        mainTerm: Record<string, string>,
        search: Store<string>,
        options?: {
            searchTerms?: Record<string, string[]>
            selected?: UIEventSource<boolean>
            forceSelected?: UIEventSource<boolean>
            squared?: boolean
            /* Hide, if not selected*/
            hide?: Store<boolean>
        }
    ) {
        super()
        this._shown = Translations.W(shown)
        this._squared = options?.squared ?? false
        const searchTerms: Record<string, string[]> = {}
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
            const main = SelfHidingToggle.clean(mainTerm[lng])
            searchTerms[lng] = [main].concat(searchTerms[lng] ?? [])
        }
        const selected = (this._selected = options?.selected ?? new UIEventSource<boolean>(false))
        const forceSelected = (this.forceSelected =
            options?.forceSelected ?? new UIEventSource<boolean>(false))
        this.matchesSearchCriteria = search.map((s) => {
            if (s === undefined || s.length === 0) {
                return true
            }

            s = s?.trim()?.toLowerCase()
            if (searchTerms[Locale.language.data]?.some((t) => t.indexOf(s) >= 0)) {
                return true
            }
            if (searchTerms["*"]?.some((t) => t.indexOf(s) >= 0)) {
                return true
            }
            return false
        })
        this.isShown = this.matchesSearchCriteria.map(
            (matchesSearch) => {
                if (selected.data && !forceSelected.data) {
                    return true
                }
                if (options?.hide?.data) {
                    return false
                }
                return matchesSearch
            },
            [selected, Locale.language, options?.hide]
        )

        const self = this
        this.isShown.addCallbackAndRun((shown) => {
            if (shown) {
                self.RemoveClass("hidden")
            } else {
                self.SetClass("hidden")
            }
        })
    }

    private static clean(s: string): string {
        return s?.trim()?.toLowerCase()?.replace(/[-]/, "")
    }

    GetValue(): UIEventSource<boolean> {
        return this._selected
    }

    IsValid(_: boolean): boolean {
        return true
    }

    protected InnerRender(): string | BaseUIElement {
        let el: BaseUIElement = this._shown
        const selected = this._selected

        selected.addCallbackAndRun((selected) => {
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
            if (forcedSelection.data) {
                selected.setData(true)
            } else {
                selected.setData(!selected.data)
            }
        })

        if (!this._squared) {
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
    public readonly someMatchFound: Store<boolean>
    private readonly selectedElements: UIEventSource<T[]>

    /**
     *
     * @param values: the values that can be selected
     * @param options
     */
    constructor(
        values: {
            show: BaseUIElement
            value: T
            mainTerm: Record<string, string>
            searchTerms?: Record<string, string[]>
            /* If there are more then 200 elements, should this element still be shown? */
            hasPriority?: Store<boolean>
        }[],
        options?: {
            /*
             * If one single value can be selected (like a radio button) or if many values can be selected (like checkboxes)
             */
            mode?: "select-one" | "select-many"
            /**
             * The values of the selected elements.
             * Use this to tie input elements together
             */
            selectedElements?: UIEventSource<T[]>
            /**
             * The search bar. Use this to seed the search value or to tie to another value
             */
            searchValue?: UIEventSource<string>
            /**
             * What is shown if the search yielded no results.
             * By default: a translated "no search results"
             */
            onNoMatches?: BaseUIElement
            /**
             * An element that is shown if no search is entered
             * Default behaviour is to show all options
             */
            onNoSearchMade?: BaseUIElement
            /**
             * Extra element to show if there are many (>200) possible mappings and when non-priority mappings are hidden
             *
             */
            onManyElements?: BaseUIElement
            searchAreaClass?: string
            hideSearchBar?: false | boolean
        }
    ) {
        const search = new TextField({ value: options?.searchValue })

        const searchBar = options?.hideSearchBar
            ? undefined
            : new Combine([
                  Svg.search_svg().SetClass("w-8 normal-background"),
                  search.SetClass("w-full"),
              ]).SetClass("flex items-center border-2 border-black m-2")

        const searchValue = search.GetValue().map((s) => s?.trim()?.toLowerCase())
        const selectedElements = options?.selectedElements ?? new UIEventSource<T[]>([])
        const mode = options?.mode ?? "select-one"
        const onEmpty = options?.onNoMatches ?? Translations.t.general.noMatchingMapping
        const forceHide = new UIEventSource(false)
        const mappedValues: {
            show: SelfHidingToggle
            mainTerm: Record<string, string>
            value: T
        }[] = values.map((v) => {
            const vIsSelected = new UIEventSource(false)

            selectedElements.addCallbackAndRunD((selectedElements) => {
                vIsSelected.setData(selectedElements.some((t) => t === v.value))
            })

            vIsSelected.addCallback((selected) => {
                if (selected) {
                    if (mode === "select-one") {
                        selectedElements.setData([v.value])
                    } else if (!selectedElements.data.some((t) => t === v.value)) {
                        selectedElements.data.push(v.value)
                        selectedElements.ping()
                    }
                } else {
                    for (let i = 0; i < selectedElements.data.length; i++) {
                        const t = selectedElements.data[i]
                        if (t == v.value) {
                            selectedElements.data.splice(i, 1)
                            selectedElements.ping()
                            break
                        }
                    }
                }
            })

            const toggle = new SelfHidingToggle(v.show, v.mainTerm, searchValue, {
                searchTerms: v.searchTerms,
                selected: vIsSelected,
                squared: mode === "select-many",
                hide:
                    v.hasPriority === undefined
                        ? forceHide
                        : forceHide.map((fh) => fh && !v.hasPriority?.data, [v.hasPriority]),
            })

            return {
                ...v,
                show: toggle,
            }
        })

        // The total number of elements that would be displayed based on the search criteria alone
        let totalShown: Store<number>
        totalShown = searchValue.map(
            (_) => mappedValues.filter((mv) => mv.show.matchesSearchCriteria.data).length
        )
        const tooMuchElementsCutoff = 40
        totalShown.addCallbackAndRunD((shown) => forceHide.setData(tooMuchElementsCutoff < shown))

        super([
            searchBar,
            new VariableUiElement(
                Locale.language.map(
                    (lng) => {
                        if (
                            options?.onNoSearchMade !== undefined &&
                            (searchValue.data === undefined || searchValue.data.length === 0)
                        ) {
                            return options?.onNoSearchMade
                        }
                        if (totalShown.data == 0) {
                            return onEmpty
                        }

                        mappedValues.sort((a, b) => (a.mainTerm[lng] < b.mainTerm[lng] ? -1 : 1))
                        let pills = new Combine(mappedValues.map((e) => e.show))
                            .SetClass("flex flex-wrap w-full content-start")
                            .SetClass(options?.searchAreaClass ?? "")

                        if (totalShown.data >= tooMuchElementsCutoff) {
                            pills = new Combine([
                                options?.onManyElements ?? Translations.t.general.useSearch,
                                pills,
                            ])
                        }
                        return pills
                    },
                    [totalShown, searchValue]
                )
            ),
        ])
        this.selectedElements = selectedElements
        this.someMatchFound = totalShown.map((t) => t > 0)
    }

    public GetValue(): UIEventSource<T[]> {
        return this.selectedElements
    }

    IsValid(_: T[]): boolean {
        return true
    }
}
