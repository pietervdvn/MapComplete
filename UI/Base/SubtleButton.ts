import Translations from "../i18n/Translations";
import Combine from "./Combine";
import BaseUIElement from "../BaseUIElement";
import Link from "./Link";
import Img from "./Img";
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";


export class SubtleButton extends UIElement {
    private readonly imageUrl: string | BaseUIElement;
    private readonly message: string | BaseUIElement;
    private readonly linkTo: { url: string | UIEventSource<string>; newTab?: boolean };


    constructor(imageUrl: string | BaseUIElement, message: string | BaseUIElement, linkTo: { url: string | UIEventSource<string>, newTab?: boolean } = undefined) {
        super();
        this.imageUrl = imageUrl;
        this.message = message;
        this.linkTo = linkTo;
    }

    protected InnerRender(): string | BaseUIElement {
        const classes = "block flex p-3 my-2 bg-subtle rounded-lg hover:shadow-xl hover:bg-unsubtle transition-colors transition-shadow link-no-underline";
        const message = Translations.W(this.message);
        let img;
        if ((this.imageUrl ?? "") === "") {
            img = undefined;
        } else if (typeof (this.imageUrl) === "string") {
            img = new Img(this.imageUrl)
        } else {
            img = this.imageUrl;
        }
        const image = new Combine([img?.SetClass("block flex items-center justify-center h-11 w-11 flex-shrink0 mr-4")])
            .SetClass("flex-shrink-0");

        message?.SetClass("block overflow-ellipsis no-images")

        const button = new Combine([
            image,
            message
        ]).SetClass("flex group w-full")

        if (this.linkTo == undefined) {
            this.SetClass(classes)
            return button
        }


        return new Link(
            button,
            this.linkTo.url,
            this.linkTo.newTab ?? false
        ).SetClass(classes)

    }


}