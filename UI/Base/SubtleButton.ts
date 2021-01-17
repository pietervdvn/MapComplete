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
            this.image = new FixedUiElement(`<img class="" src="${imageUrl}" alt="">`);
        } else {
            this.image = imageUrl;
        }

        // Reset the loading message once things are loaded
        document.getElementById('centermessage').innerText = '';
    }

    InnerRender(): string {

        if(this.message !== null && this.message.IsEmpty()){
            // Message == null: special case to force empty text
            return "";
        }

        if(this.linkTo != undefined){
            return new Combine([
                `<a class='block flex group p-3 my-2 bg-white rounded-lg ring-2 ring-white hover:ring-2 hover:ring-white hover:shadow-xl shadow-inner hover:bg-blue-100' href="${this.linkTo.url}" ${this.linkTo.newTab ? 'target="_blank"' : ""}>`,
                `<div class='flex-shrink-0'>`,
                `<div class='flex items-center justify-center h-11 w-11'>`,
                this.image,
                `</div>`,
                `</div>`,
                `<div class='ml-4'>`,
                this.message,
                `</div>`,
                `</a>`
            ]).Render();
        }

        // Styling todo
        return new Combine([
            '<span class="">',
            this.image,
            this.message,
            '</span>'
        ]).Render();
    }


}