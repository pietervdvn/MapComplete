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
        let img;
        if ((imageUrl ?? "") === "") {
            img = new FixedUiElement("");
        } else if (typeof (imageUrl) === "string") {
            img = new FixedUiElement(`<img style="width: 100%;" src="${imageUrl}" alt="">`);
        } else {
            img = imageUrl;
        }
        img.SetClass("block flex items-center justify-center h-11 w-11 flex-shrink0")
        this.image = new Combine([img])
            .SetClass("flex-shrink-0");
        
       
    }

    InnerRender(): string {

        if(this.message !== null && this.message.IsEmpty()){
            // Message == null: special case to force empty text
            return "";
        }

        if(this.linkTo != undefined){
            return new Combine([
                `<a class='block flex group p-3 my-2 bg-blue-100 rounded-lg hover:shadow-xl hover:bg-blue-200' href="${this.linkTo.url}" ${this.linkTo.newTab ? 'target="_blank"' : ""}>`,
                this.image,
                `<div class='ml-4'>`,
                this.message,
                `</div>`,
                `</a>`
            ]).Render();
        }

        // Styling todo
        return new Combine([
            this.image,
            this.message,
        ]).SetClass("block flex p-3 my-2 bg-blue-100 rounded-lg hover:shadow-xl hover:bg-blue-200")
            .Render();
    }


}