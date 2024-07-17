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
    public readonly _svelteComponent: {
        new (args: {
            target: HTMLElement
            props: Props
            events?: Events
            slots?: Slots
        }): SvelteComponentTyped<Props, Events, Slots>
    }
    public readonly _props: Props
    public readonly _events: Events
    public readonly _slots: Slots
    private tag: "div" | "span" = "div"
    public readonly isSvelte = true

    constructor(svelteElement, props?: Props, events?: Events, slots?: Slots) {
        super()
        this._svelteComponent = <any> svelteElement
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

    public getClass(){
        if(this.clss.size === 0){
            return undefined
        }
        return this.clss
    }

    public getStyle(){
        if(this.style === ""){
            return undefined
        }
        return this.style
    }
}
