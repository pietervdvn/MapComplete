import BaseUIElement from "../BaseUIElement"

import { SvelteComponentTyped } from "svelte"

/**
 * The SvelteUIComponent serves as a translating class which which wraps a SvelteElement into the BaseUIElement framework.
 */
export default class SvelteUIElement<
    Props extends Record<string, any> = any,
    Events extends Record<string, any> = any,
    Slots extends Record<string, any> = any
> extends BaseUIElement {
    private readonly _svelteComponent: {
        new (args: {
            target: HTMLElement
            props: Props
            events?: Events
            slots?: Slots
        }): SvelteComponentTyped<Props, Events, Slots>
    }
    private readonly _props: Props

    constructor(svelteElement, props: Props) {
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
