import BaseUIElement from "../BaseUIElement"
import { Utils } from "../../Utils"
/**
 * @deprecated
 */
export class FixedUiElement extends BaseUIElement {
    public readonly content: string

    constructor(html: string) {
        super()
        this.content = html ?? ""
    }

    AsMarkdown(): string {
        if (this.HasClass("code")) {
            if (this.content.indexOf("\n") > 0 || this.HasClass("block")) {
                return "\n```\n" + this.content + "\n```\n"
            }
            return "`" + this.content + "`"
        }
        if (this.HasClass("font-bold")) {
            return "*" + this.content + "*"
        }
        return this.content
    }

    protected InnerConstructElement(): HTMLElement {
        const e = document.createElement("span")
        e.innerHTML = Utils.purify(this.content)
        return e
    }
}
