import { UIElement } from "../UIElement"
import BaseUIElement from "../BaseUIElement"

/**
 * Introduces a new element which has an ID
 * Mostly a workaround for the import viewer
 */
export default class DivContainer extends BaseUIElement {
    private readonly _id: string

    constructor(id: string) {
        super()
        this._id = id
    }
    protected InnerConstructElement(): HTMLElement {
        const e = document.createElement("div")
        e.id = this._id
        return e
    }
}
