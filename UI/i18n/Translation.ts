import { UIElement } from "../UIElement"
import Locale from "./Locale"


export default class Translation extends UIElement{
    get txt(): string {
        return this.translations[Locale.language.data]
    }

    protected InnerRender(): string {
        return this.txt
    }

    public readonly translations: object
    
    constructor(translations: object) {
        super(Locale.language)
        this.translations = translations
    }
}
