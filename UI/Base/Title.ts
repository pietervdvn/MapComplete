import BaseUIElement from "../BaseUIElement";
import {FixedUiElement} from "./FixedUiElement";

export default class Title extends BaseUIElement {
    private readonly _embedded: BaseUIElement;
    private readonly _level: number;

    constructor(embedded: string | BaseUIElement, level: number = 3) {
        super()
        if (typeof embedded === "string") {
            this._embedded = new FixedUiElement(embedded)
        } else {
            this._embedded = embedded
        }
        this._level = level;
    }

    AsMarkdown(): string {
        const embedded = " " + this._embedded.AsMarkdown() + " ";

        if (this._level == 1) {
            return "\n\n" + embedded + "\n" + "=".repeat(embedded.length) + "\n\n"
        }

        if (this._level == 2) {
            return "\n\n" + embedded + "\n" + "-".repeat(embedded.length) + "\n\n"
        }

        return "\n\n" + "#".repeat(this._level) + embedded + "\n\n";
    }

    protected InnerConstructElement(): HTMLElement {
        const el = this._embedded.ConstructElement()
        if (el === undefined) {
            return undefined;
        }
        const h = document.createElement("h" + this._level)
        h.appendChild(el)
        return h;
    }
}