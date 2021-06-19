import Translations from "../i18n/Translations";
import Combine from "./Combine";
import BaseUIElement from "../BaseUIElement";
import Link from "./Link";
import Img from "./Img";
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";


export class SubtleButton extends UIElement {

    private readonly _element: BaseUIElement

    constructor(imageUrl: string | BaseUIElement, message: string | BaseUIElement, linkTo: { url: string | UIEventSource<string>, newTab?: boolean } = undefined) {
        super();
        this._element = SubtleButton.generateContent(imageUrl, message, linkTo)
        this.SetClass("block flex p-3 my-2 bg-blue-100 rounded-lg hover:shadow-xl hover:bg-blue-200 link-no-underline")

    }

    private static generateContent(imageUrl: string | BaseUIElement, messageT: string | BaseUIElement, linkTo: { url: string | UIEventSource<string>, newTab?: boolean } = undefined): BaseUIElement {
        const message = Translations.W(messageT);
        message
        let img;
        if ((imageUrl ?? "") === "") {
            img = undefined;
        } else if (typeof (imageUrl) === "string") {
            img = new Img(imageUrl)
        } else {
            img = imageUrl;
        }
        img?.SetClass("block flex items-center justify-center h-11 w-11 flex-shrink0 mr-4")
        const image = new Combine([img])
            .SetClass("flex-shrink-0");

        if (linkTo == undefined) {
            return new Combine([
                image,
                message?.SetClass("block overflow-ellipsis"),
            ]).SetClass("flex group w-full");
        }


        return new Link(
            new Combine([
                image,
                message?.SetClass("block overflow-ellipsis")
            ]).SetClass("flex group w-full"),
            linkTo.url,
            linkTo.newTab ?? false
        )
    }

    protected InnerRender(): string | BaseUIElement {
        return this._element;
    }


}