import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";

export class VariableUiElement extends BaseUIElement {
    private readonly _contents: UIEventSource<string | BaseUIElement | BaseUIElement[]>;

    constructor(contents: UIEventSource<string | BaseUIElement | BaseUIElement[]>) {
        super();
        this._contents = contents;
    }
    
    Destroy() {
        super.Destroy();
        this.isDestroyed = true;
    }

    protected InnerConstructElement(): HTMLElement {
        const el = document.createElement("span");
        const self = this;
        this._contents.addCallbackAndRun((contents) => {
            if(self.isDestroyed){
                return true;
            }
            while (el.firstChild) {
                el.removeChild(el.lastChild);
            }

            if (contents === undefined) {
                return
            }
            if (typeof contents === "string") {
                el.innerHTML = contents;
            } else if (contents instanceof Array) {
                for (const content of contents) {
                    const c = content?.ConstructElement();
                    if (c !== undefined && c !== null) {
                        el.appendChild(c);
                    }
                }
            } else {
                const c = contents.ConstructElement();
                if (c !== undefined && c !== null) {
                    el.appendChild(c);
                }
            }
        });
        return el;
    }
}
