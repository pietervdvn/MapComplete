import BaseUIElement from "../BaseUIElement";
import {FixedUiElement} from "./FixedUiElement";
import Hash from "../../Logic/Web/Hash";

export default class Title extends BaseUIElement {
    public readonly title: BaseUIElement;
    public readonly level: number;
    public readonly id : string
    
    private static readonly defaultClassesPerLevel = ["", "text-3xl font-bold","text-2xl font-bold","text-xl font-bold", "text-lg font-bold"]

    constructor(embedded: string | BaseUIElement, level: number = 3) {
        super()
        if (typeof embedded === "string") {
            this.title = new FixedUiElement(embedded)
        } else {
            this.title = embedded
        }
        this.level = level;
        this.id = this.title.ConstructElement()?.innerText?.replace(/ /g, '_') ?? ""
        this.SetClass(Title.defaultClassesPerLevel[level] ?? "")
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
        el.id = this.id
        return h;
    }
}