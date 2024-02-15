import BaseUIElement from "../BaseUIElement"
import { Store } from "../../Logic/UIEventSource"
import { UIElement } from "../UIElement"
import SvelteUIElement from "./SvelteUIElement"
import SubtleLink from "./SubtleLink.svelte"
import Translations from "../i18n/Translations"
import Combine from "./Combine"
import Img from "./Img"

/**
 * @deprecated
 */
export class SubtleButton extends UIElement {
    private readonly imageUrl: string | BaseUIElement
    private readonly message: string | BaseUIElement
    private readonly options: {
        url?: string | Store<string>
        newTab?: boolean
        imgSize?: string
        extraClasses?: string
    }

    constructor(
        imageUrl: string | BaseUIElement,
        message: string | BaseUIElement,
        options: {
            url?: string | Store<string>
            newTab?: boolean
            imgSize?: "h-11 w-11" | string
            extraClasses?: string
        } = {}
    ) {
        super()
        this.imageUrl = imageUrl
        this.message = message
        this.options = options
    }

    protected InnerRender(): string | BaseUIElement {
        if (this.options.url !== undefined) {
            return new SvelteUIElement(SubtleLink, {
                href: this.options.url,
                newTab: this.options.newTab,
            })
        }

        const classes = "button"
        const message = Translations.W(this.message)?.SetClass(
            "block overflow-ellipsis no-images flex-shrink"
        )
        let img
        const imgClasses =
            "block justify-center flex-none mr-4 " + (this.options?.imgSize ?? "h-11 w-11")
        if ((this.imageUrl ?? "") === "") {
            img = undefined
        } else if (typeof this.imageUrl === "string") {
            img = new Img(this.imageUrl)?.SetClass(imgClasses)
        } else {
            img = this.imageUrl?.SetClass(imgClasses)
        }
        const button = new Combine([img, message]).SetClass("flex items-center group w-full")

        this.SetClass(classes)
        return button
    }
}
