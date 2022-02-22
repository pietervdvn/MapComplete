import Combine from "./Combine";
import Svg from "../../Svg";
import Translations from "../i18n/Translations";
import BaseUIElement from "../BaseUIElement";

export default class Loading extends Combine {
    constructor(msg?: BaseUIElement | string) {
        const t = Translations.W(msg) ?? Translations.t.general.loading;
        t.SetClass("pl-2")
        super([
            Svg.loading_svg()
                .SetClass("animate-spin self-center")
                .SetStyle("width: 1.5rem; height: 1.5rem; min-width: 1.5rem;"),
            t
        ])
        this.SetClass("flex p-1")
    }
}