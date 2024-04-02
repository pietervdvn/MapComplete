import BaseUIElement from "../BaseUIElement"
import { FixedUiElement } from "./FixedUiElement"
import { Utils } from "../../Utils"

export default class Title extends BaseUIElement {
    private static readonly defaultClassesPerLevel = [
        "",
        "text-3xl font-bold",
        "text-2xl font-bold",
        "text-xl font-bold",
        "text-lg font-bold",
    ]
    public readonly title: BaseUIElement
    public readonly level: number
    public readonly id: string

    constructor(embedded: string | BaseUIElement, level: number = 3) {
        super()
        if (embedded === undefined) {
            console.warn("A title should have some content. Undefined is not allowed")
            embedded = ""
        }
        if (typeof embedded === "string") {
            this.title = new FixedUiElement(embedded)
        } else {
            this.title = embedded
        }
        this.level = level

        let text: string = undefined
        if (typeof embedded === "string") {
            text = embedded
        } else if (embedded instanceof FixedUiElement) {
            text = embedded.content
        } else {
            if (!Utils.runningFromConsole) {
                text = embedded.ConstructElement()?.textContent
            }
        }

        this.id =
            text
                ?.replace(/ /g, "-")
                ?.replace(/[?#.;:/]/, "")
                ?.toLowerCase() ?? ""
        this.SetClass(Title.defaultClassesPerLevel[level] ?? "")
    }

    AsMarkdown(): string {
        const embedded = " " + this.title.AsMarkdown() + " "

        if (this.level == 1) {
            return "\n\n" + embedded + "\n" + "=".repeat(embedded.length) + "\n\n"
        }

        if (this.level == 2) {
            return "\n\n" + embedded + "\n" + "-".repeat(embedded.length) + "\n\n"
        }

        return "\n\n" + "#".repeat(this.level) + embedded + "\n\n"
    }

    protected InnerConstructElement(): HTMLElement {
        const el = this.title.ConstructElement()
        if (el === undefined) {
            return undefined
        }
        const h = document.createElement("h" + this.level)
        h.appendChild(el)
        el.id = this.id
        return h
    }
}
