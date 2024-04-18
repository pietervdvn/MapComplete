import BaseUIElement from "../BaseUIElement"

import { SvelteComponentTyped } from "svelte"

/**
 * The SvelteUIComponent serves as a translating class which which wraps a SvelteElement into the BaseUIElement framework.
 * Also see ToSvelte.svelte for the opposite conversion
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
    private readonly _events: Events
    private readonly _slots: Slots
    private tag: "div" | "span" = "div"

    constructor(svelteElement, props?: Props, events?: Events, slots?: Slots) {
        super()
        this._svelteComponent = svelteElement
        this._props = props ?? <Props>{}
        this._events = events
        this._slots = slots
    }

    public setSpan() {
        this.tag = "span"
        return this
    }

    protected InnerConstructElement(): HTMLElement {
        const el = document.createElement(this.tag)
        new this._svelteComponent({
            target: el,
            props: this._props,
            events: this._events,
            slots: this._slots,
        })
        return el
    }
}
