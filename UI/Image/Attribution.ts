import {UIElement} from "../UIElement";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";

export default class Attribution extends Combine {

    constructor(author: UIElement | string, license: UIElement | string, icon: UIElement) {
        super([
            icon?.SetClass("block left").SetStyle("height: 2em; width: 2em; padding-right: 0.5em"),
            new Combine([
                Translations.W(author).SetClass("block font-bold"),
                Translations.W((license ?? "") === "undefined" ? "CC0" : (license ?? ""))
            ]).SetClass("flex flex-col")
        ]);
        this.SetClass("flex flex-row bg-black text-white text-sm absolute bottom-0 left-0 p-0.5 pl-5 pr-3 rounded-lg");
    }

}