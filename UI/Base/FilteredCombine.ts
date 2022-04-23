import BaseUIElement from "../BaseUIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {VariableUiElement} from "./VariableUIElement";
import Combine from "./Combine";
import Locale from "../i18n/Locale";
import {Utils} from "../../Utils";

export default class FilteredCombine extends VariableUiElement {

    /**
     * Only shows item matching the search
     * If predicate of an item is undefined, it will be filtered out as soon as a non-null or non-empty search term is given
     * @param entries
     * @param searchedValue
     * @param options
     */
    constructor(entries: {
                    element: BaseUIElement | string,
                    predicate?: (s: string) => boolean
                }[],
                searchedValue: UIEventSource<string>,
                options?: {
                    onEmpty?: BaseUIElement | string,
                    innerClasses: string
                }
    ) {
        entries = Utils.NoNull(entries)
        super(searchedValue.map(searchTerm => {
            if(searchTerm === undefined || searchTerm === ""){
                return new Combine(entries.map(e => e.element)).SetClass(options?.innerClasses ?? "")
            }
            const kept = entries.filter(entry => entry?.predicate !== undefined && entry.predicate(searchTerm))
            if (kept.length === 0) {
                return options?.onEmpty
            }
            return new Combine(kept.map(entry => entry.element)).SetClass(options?.innerClasses ?? "")
        }, [Locale.language]))
    }

}