import { UIElement } from "../UIElement"
import Locale from "./Locale"


export default class Translation extends UIElement{
    protected InnerRender(): string {
        return this.translations[Locale.language.data]
    }

    public readonly translations: object
    
    constructor(translations: object) {
        super(Locale.language)
        this.translations = translations
    }
}
