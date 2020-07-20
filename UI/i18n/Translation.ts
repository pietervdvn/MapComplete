import { UIElement } from "../UIElement"
import Locale from "./Locale"
import {FixedUiElement} from "../Base/FixedUiElement";


export default class Translation extends UIElement {

    public readonly translations: object

    constructor(translations: object) {
        super(Locale.language)
        this.translations = translations
    }

    public R(): string {
        return new Translation(this.translations).Render();
    }

    InnerRender(): string {
        const txt = this.translations[Locale.language.data];
        if (txt !== undefined) {
            return txt;
        }
        const en = this.translations["en"];
        console.warn("No translation for language ", Locale.language.data, "for",en);
        return en;
    }


}
