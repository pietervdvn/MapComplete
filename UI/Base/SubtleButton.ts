import {UIElement} from "../UIElement";
import Translations from "../i18n/Translations";
import Combine from "./Combine";
import {FixedUiElement} from "./FixedUiElement";


export class SubtleButton extends Combine {

    constructor(imageUrl: string | UIElement, message: string | UIElement, linkTo: { url: string, newTab?: boolean } = undefined) {
        super(SubtleButton.generateContent(imageUrl, message, linkTo));

        this.SetClass("block flex p-3 my-2 bg-blue-100 rounded-lg hover:shadow-xl hover:bg-blue-200 link-no-underline")

    }

    private static generateContent(imageUrl: string | UIElement, messageT: string | UIElement, linkTo: { url: string, newTab?: boolean } = undefined): (UIElement | string)[] {
        const message = Translations.W(messageT);
        if (message !== null) {
            message.dumbMode = false;
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
        const image = new Combine([img])
            .SetClass("flex-shrink-0");


        if (message !== null && message.IsEmpty()) {
            // Message == null: special case to force empty text
            return [];
        }

        if (linkTo != undefined) {
            return [
                `<a class='flex group' href="${linkTo.url}" ${linkTo.newTab ? 'target="_blank"' : ""}>`,
                image,
                `<div class='ml-4 overflow-ellipsis'>`,
                message,
                `</div>`,
                `</a>`
            ];
        }

        return [
            image,
            message,
        ];

    }


}