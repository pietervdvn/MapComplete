import {UIElement} from "../UIElement";
import Translations from "../i18n/Translations";
import Combine from "./Combine";


export class SubtleButton extends UIElement{
    private imageUrl: string;
    private message: UIElement;

    constructor(imageUrl: string, message: string | UIElement) {
        super(undefined);
        this.message = Translations.W(message);
        this.imageUrl = imageUrl;
        
    }

    InnerRender(): string {
        return new Combine([
            '<span class="subtle-button">',
            `<img src='${this.imageUrl}'>`,
            this.message,
            '</span>'
        ]).Render();
    }


}