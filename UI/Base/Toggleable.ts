import BaseUIElement from "../BaseUIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "./Combine";

export class Accordeon extends Combine {

    constructor(toggles: Toggleable[]) {

        for (const el of toggles) {
            el.isVisible.addCallbackAndRun(isVisible => toggles.forEach(toggle => {
                if (toggle !== el && isVisible) {
                    toggle.isVisible.setData(false)
                }
            }))
        }
        
        super(toggles);
    }

}


export default class Toggleable extends BaseUIElement {
    public readonly isVisible = new UIEventSource(false)
    private readonly title: BaseUIElement;
    private readonly content: BaseUIElement;

    constructor(title: BaseUIElement, content: BaseUIElement) {
        super()
        this.title = title;
        this.content = content;
        this.content.SetClass("animate-height border-l-4 border-gray-300 pl-2")
        this.title.SetClass("background-subtle rounded-lg")
        const self = this
        this.onClick(() => self.isVisible.setData(!self.isVisible.data))
    }

    protected InnerConstructElement(): HTMLElement {

        const title = this.title.ConstructElement()
        const content = this.content.ConstructElement()

        this.isVisible.addCallbackAndRun(isVisible => {
            if (isVisible) {
                content.style.maxHeight = "100vh"
                content.style["-webkit-mask-image"] = "unset"
            } else {
                content.style["-webkit-mask-image"] = "-webkit-gradient(linear, left top, left bottom, from(rgba(0,0,0,1)), to(rgba(0,0,0,0)))"
                content.style.maxHeight = "2rem"
            }
        })

        const div = document.createElement("div")
        div.appendChild(title)
        div.appendChild(content)


        return div;
    }

}