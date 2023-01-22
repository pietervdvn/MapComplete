import BaseUIElement from "../BaseUIElement"

/**
 * The SvelteUIComponent serves as a translating class which which wraps a SvelteElement into the BaseUIElement framework.
 */
export default class SvelteUIElement extends BaseUIElement {
    private readonly _svelteComponent
    private readonly _props: Record<string, any>

    constructor(svelteElement, props: Record<string, any>) {
        super()
        this._svelteComponent = svelteElement
        this._props = props
    }

    protected InnerConstructElement(): HTMLElement {
        const el = document.createElement("div")
        new this._svelteComponent({
            target: el,
            props: this._props,
        })
        return el
    }
}
