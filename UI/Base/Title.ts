import BaseUIElement from "../BaseUIElement";
import {FixedUiElement} from "./FixedUiElement";
import {Utils} from "../../Utils";

export default class Title extends BaseUIElement {
    private static readonly defaultClassesPerLevel = ["", "text-3xl font-bold", "text-2xl font-bold", "text-xl font-bold", "text-lg font-bold"]
    public readonly title: BaseUIElement;
    public readonly level: number;
    public readonly id: string

    constructor(embedded: string | BaseUIElement, level: number = 3) {
        super()
        if (embedded === undefined) {
            throw "A title should have some content. Undefined is not allowed"
        }
        if (typeof embedded === "string") {
            this.title = new FixedUiElement(embedded)
        } else {
            this.title = embedded
        }
        this.level = level;

        let innerText: string = undefined;
        if (typeof embedded === "string") {
            innerText = embedded
        } else if (embedded instanceof FixedUiElement) {
            innerText = embedded.content
        } else {
            if (Utils.runningFromConsole) {
                console.log("Not constructing an anchor for title with embedded content of " + embedded)
            } else {
                innerText = embedded.ConstructElement()?.innerText
            }
        }

        this.id = innerText?.replace(/ /g, '-')
            ?.replace(/[?#.;:/]/, "")
            ?.toLowerCase() ?? ""
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