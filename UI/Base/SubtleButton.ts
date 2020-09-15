import {UIElement} from "../UIElement";
import Translations from "../i18n/Translations";
import Combine from "./Combine";
import {FixedUiElement} from "./FixedUiElement";


export class SubtleButton extends UIElement{
    private readonly image: UIElement;
    private readonly message: UIElement;
    private readonly linkTo: { url: string, newTab?: boolean } = undefined;

    constructor(imageUrl: string | UIElement, message: string | UIElement, linkTo: { url: string, newTab?: boolean } = undefined) {
        super(undefined);
        this.linkTo = linkTo;
        this.message = Translations.W(message);
        if(this.message !== null){
        this.message.dumbMode = false;
        }
        if ((imageUrl ?? "") === "") {
            this.image = new FixedUiElement("");
        } else if (typeof (imageUrl) === "string") {
            this.image = new FixedUiElement(`<img src="${imageUrl}">`);
        } else {
            this.image = imageUrl;
        }

    }

    InnerRender(): string {
        
        if(this.message !== null && this.message.IsEmpty()){
            // Message == null: special case to force empty text
            return "";
        }

        if(this.linkTo != undefined){
            return new Combine([
                `<a class="subtle-button" href="${this.linkTo.url}" ${this.linkTo.newTab ? 'target="_blank"' : ""}>`,
                this.image,
                this.message,
                '</a>'
            ]).Render();
        }
        
        return new Combine([
            '<span class="subtle-button">',
            this.image,
            this.message,
            '</span>'
        ]).Render();
    }


}