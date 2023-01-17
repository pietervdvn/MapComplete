import BaseUIElement from "../BaseUIElement"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { UIElement } from "../UIElement"
import { VariableUiElement } from "./VariableUIElement"
import Lazy from "./Lazy"
import Loading from "./Loading"
import SubtleButtonSvelte from "./SubtleButton.svelte"
import SvelteUIElement from "./SvelteUIElement"

export class SubtleButton extends UIElement {
    private readonly imageUrl: string | BaseUIElement
    private readonly message: string | BaseUIElement
    private readonly options: {
        url?: string | Store<string>
        newTab?: boolean
        imgSize?: string,
        extraClasses?: string
    }

    constructor(
        imageUrl: string | BaseUIElement,
        message: string | BaseUIElement,
        options: {
            url?: string | Store<string>
            newTab?: boolean
            imgSize?: "h-11 w-11" | string,
            extraClasses?: string
        } = {}
    ) {
        super()
        this.imageUrl = imageUrl
        this.message = message
        this.options = options
    }

    protected InnerRender(): string | BaseUIElement {
        return new SvelteUIElement(SubtleButtonSvelte, {
            imageUrl: this?.imageUrl ?? undefined,
            message: this?.message ?? "",
            options: this?.options ?? {},
        })
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
