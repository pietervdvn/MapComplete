import { UIElement } from "../UIElement"
import Locale from "./Locale"
import {FixedUiElement} from "../Base/FixedUiElement";


export default class Translation extends UIElement {
    get txt(): string {
        const txt = this.translations[Locale.language.data];
        if (txt !== undefined) {
            return txt;
        }
        const en = this.translations["en"];
        console.warn("No translation for language ", Locale.language.data, "for", en);
        if (en !== undefined) {
            return en;
        }
        for (const i in this.translations) {
            return this.translations[i]; // Return a random language
        }
        return "Missing translation"
    }

    InnerRender(): string {
        return this.txt
    }

    public readonly translations: object

    constructor(translations: object) {
        super(Locale.language)
        this.translations = translations
    }


    public R(): string {
        return new Translation(this.translations).Render();
    }

}
