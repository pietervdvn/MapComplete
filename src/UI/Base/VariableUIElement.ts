import { Store } from "../../Logic/UIEventSource"
import BaseUIElement from "../BaseUIElement"
import Combine from "./Combine"
import { Utils } from "../../Utils"

/**
 * @deprecated
 */
export class VariableUiElement extends BaseUIElement {
    private readonly _contents?: Store<string | BaseUIElement | BaseUIElement[]>

    constructor(contents?: Store<string | BaseUIElement | BaseUIElement[]>) {
        super()
        this._contents = contents
    }

    Destroy() {
        super.Destroy()
        this.isDestroyed = true
    }

    AsMarkdown(): string {
        const d = this._contents?.data
        if (typeof d === "string") {
            return d
        }
        if (d instanceof BaseUIElement) {
            return d.AsMarkdown()
        }
        return new Combine(<BaseUIElement[]>d).AsMarkdown()
    }

    protected InnerConstructElement(): HTMLElement {
        const el = document.createElement("span")
        const self = this
        this._contents?.addCallbackAndRun((contents) => {
            if (self.isDestroyed) {
                return true
            }

            while (el.firstChild) {
                el.removeChild(el.lastChild)
            }

            if (contents === undefined || contents === null) {
                return
            }
            if (typeof contents === "string") {
                el.innerHTML = Utils.purify(contents)
            } else if (contents instanceof Array) {
                for (const content of contents) {
                    const c = content?.ConstructElement()
                    if (c !== undefined && c !== null) {
                        el.appendChild(c)
                    }
                }
            } else if (contents.ConstructElement) {
                const c = contents.ConstructElement()
                if (c !== undefined && c !== null) {
                    el.appendChild(c)
                }
            } else {
                console.error("Could not construct a variable UI element for", contents)
            }
        })
        return el
    }
}
