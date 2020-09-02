import {UIElement} from "../UIElement";
import Translations from "../i18n/Translations";
import Combine from "./Combine";


export class SubtleButton extends UIElement{
    private readonly imageUrl: string;
    private readonly message: UIElement;
    private readonly linkTo: { url: string, newTab?: boolean } = undefined;

    constructor(imageUrl: string, message: string | UIElement, linkTo: { url: string, newTab?: boolean } = undefined) {
        super(undefined);
        this.linkTo = linkTo;
        this.message = Translations.W(message);
        this.imageUrl = imageUrl;

    }

    InnerRender(): string {
        
        if(this.message !== null && this.message.IsEmpty()){
            return "";
        }

        if(this.linkTo != undefined){
            return new Combine([
                `<a class="subtle-button" href="${this.linkTo.url}" ${this.linkTo.newTab ? 'target="_blank"' : ""}>`,
                this.imageUrl !== undefined ? `<img src='${this.imageUrl}'>` : "",
                this.message ?? "",
                '</a>'
            ]).Render();
        }
        
        return new Combine([
            '<span class="subtle-button">',
            this.imageUrl !== undefined ? `<img src='${this.imageUrl}'>` : "",
            this.message ?? "",
            '</span>'
        ]).Render();
    }


}