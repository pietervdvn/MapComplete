import BaseUIElement from "../BaseUIElement"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { UIElement } from "../UIElement"
import { VariableUiElement } from "./VariableUIElement"
import Lazy from "./Lazy"
import Loading from "./Loading"
import SubtleButtonSvelte from "./SubtleButton.svelte"
import SvelteUIElement from "./SvelteUIElement"
import SubtleLink from "./SubtleLink.svelte";
import Translations from "../i18n/Translations";
import Combine from "./Combine";
import Img from "./Img";

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
        if(this.options.url !== undefined){
            return new SvelteUIElement(SubtleLink, {href: this.options.url, newTab: this.options.newTab})
        }

        const classes = "block flex p-3 my-2 bg-subtle rounded-lg hover:shadow-xl hover:bg-unsubtle transition-colors transition-shadow link-no-underline";
        const message = Translations.W(this.message)?.SetClass("block overflow-ellipsis no-images flex-shrink");
        let img;
        const imgClasses = "block justify-center flex-none mr-4 " + (this.options?.imgSize ?? "h-11 w-11")
        if ((this.imageUrl ?? "") === "") {
            img = undefined;
        } else if (typeof (this.imageUrl) === "string") {
            img = new Img(this.imageUrl)?.SetClass(imgClasses)
        } else {
            img = this.imageUrl?.SetClass(imgClasses);
        }
        const button = new Combine([
            img,
            message
        ]).SetClass("flex items-center group w-full")


        this.SetClass(classes)
        return button
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
