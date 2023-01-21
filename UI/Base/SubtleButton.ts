import Translations from "../i18n/Translations"
import Combine from "./Combine"
import BaseUIElement from "../BaseUIElement"
import Link from "./Link"
import Img from "./Img"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { UIElement } from "../UIElement"
import { VariableUiElement } from "./VariableUIElement"
import Lazy from "./Lazy"
import Loading from "./Loading"

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
        } = undefined
    ) {
        super()
        this.imageUrl = imageUrl
        this.message = message
        this.options = options
    }

    protected InnerRender(): string | BaseUIElement {
        const classes =
            "block flex p-3 my-2 bg-subtle rounded-lg hover:shadow-xl hover:bg-unsubtle transition-colors transition-shadow link-no-underline " +
            (this?.options?.extraClasses ?? "")
        const message = Translations.W(this.message)?.SetClass(
            "block text-ellipsis no-images flex-shrink"
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

        if (this.options?.url == undefined) {
            this.SetClass(classes)
            return button
        }

        return new Link(button, this.options.url, this.options.newTab ?? false).SetClass(classes)
    }

    public OnClickWithLoading(
        loadingText: BaseUIElement | string,
        action: () => Promise<void>
    ): BaseUIElement {
        const state = new UIEventSource<"idle" | "running">("idle")
        const button = this

        button.onClick(async () => {
            state.setData("running")
            try {
                await action()
            } catch (e) {
                console.error(e)
            } finally {
                state.setData("idle")
            }
        })
        const loading = new Lazy(() => new Loading(loadingText))
        return new VariableUiElement(
            state.map((st) => {
                if (st === "idle") {
                    return button
                }
                return loading
            })
        )
    }
}
