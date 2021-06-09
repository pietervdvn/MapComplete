import Translations from "../i18n/Translations";
import Combine from "./Combine";
import BaseUIElement from "../BaseUIElement";
import Link from "./Link";
import Img from "./Img";
import {UIEventSource} from "../../Logic/UIEventSource";


export class SubtleButton extends Combine {

    constructor(imageUrl: string | BaseUIElement, message: string | BaseUIElement, linkTo: { url: string | UIEventSource<string>, newTab?: boolean } = undefined) {
        super(SubtleButton.generateContent(imageUrl, message, linkTo));

        this.SetClass("block flex p-3 my-2 bg-blue-100 rounded-lg hover:shadow-xl hover:bg-blue-200 link-no-underline")

    }

    private static generateContent(imageUrl: string | BaseUIElement, messageT: string | BaseUIElement, linkTo: { url: string | UIEventSource<string>, newTab?: boolean } = undefined): (BaseUIElement   )[] {
        const message = Translations.W(messageT);
        let img;
        if ((imageUrl ?? "") === "") {
            img = undefined;
        } else if (typeof (imageUrl) === "string") {
            img = new Img(imageUrl).SetClass("w-full")
        } else {
            img = imageUrl;
        }
        img?.SetClass("block flex items-center justify-center h-11 w-11 flex-shrink0")
        const image = new Combine([img])
            .SetClass("flex-shrink-0");
        
        if (linkTo == undefined) {
            return [
                image,
                message,
            ];
        }
        
        
        return [
            new Link(
                new Combine([
                    image,
                    message?.SetClass("block ml-4 overflow-ellipsis")
                ]).SetClass("flex group"),
                linkTo.url,
                linkTo.newTab ?? false
            )
        ];

    }


}