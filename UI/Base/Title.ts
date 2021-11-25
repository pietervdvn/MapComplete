import BaseUIElement from "../BaseUIElement";
import {FixedUiElement} from "./FixedUiElement";

export default class Title extends BaseUIElement {
    public readonly title: BaseUIElement;
    public readonly level: number;

    constructor(embedded: string | BaseUIElement, level: number = 3) {
        super()
        if (typeof embedded === "string") {
            this.title = new FixedUiElement(embedded)
        } else {
            this.title = embedded
        }
        this.level = level;
    }

    AsMarkdown(): string {
        const embedded = " " + this.title.AsMarkdown() + " ";

        if (this.level == 1) {
            return "\n\n" + embedded + "\n" + "=".repeat(embedded.length) + "\n\n"
        }

        if (this.level == 2) {
            return "\n\n" + embedded + "\n" + "-".repeat(embedded.length) + "\n\n"
        }

        return "\n\n" + "#".repeat(this.level) + embedded + "\n\n";
    }

    protected InnerConstructElement(): HTMLElement {
        const el = this.title.ConstructElement()
        if (el === undefined) {
            return undefined;
        }
        const h = document.createElement("h" + this.level)
        h.appendChild(el)
        return h;
    }
}