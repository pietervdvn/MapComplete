import Combine from "./Combine"
import Translations from "../i18n/Translations"
import BaseUIElement from "../BaseUIElement"
import SvelteUIElement from "./SvelteUIElement"
import {default as LoadingSvg} from "../../assets/svg/Loading.svelte"
export default class Loading extends Combine {
    constructor(msg?: BaseUIElement | string) {
        const t = Translations.W(msg) ?? Translations.t.general.loading
        t.SetClass("pl-2")
        super([
            new SvelteUIElement(LoadingSvg)
                .SetClass("animate-spin self-center")
                .SetStyle("width: 1.5rem; height: 1.5rem; min-width: 1.5rem;"),
            t,
        ])
        this.SetClass("flex p-1")
    }
}
