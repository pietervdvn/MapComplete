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


export default class Toggleable extends Combine {
    public readonly isVisible = new UIEventSource(false)

    constructor(title: BaseUIElement, content: BaseUIElement) {
        super([title, content])
        content.SetClass("animate-height border-l-4 border-gray-300 pl-2")
        title.SetClass("background-subtle rounded-lg")
        const self = this
        this.onClick(() => self.isVisible.setData(!self.isVisible.data))
        const contentElement = content.ConstructElement()

        this.isVisible.addCallbackAndRun(isVisible => {
            if (isVisible) {
                contentElement.style.maxHeight = "100vh"
                contentElement.style["-webkit-mask-image"] = "unset"
            } else {
                contentElement.style["-webkit-mask-image"] = "-webkit-gradient(linear, left top, left bottom, from(rgba(0,0,0,1)), to(rgba(0,0,0,0)))"
                contentElement.style.maxHeight = "2rem"
            }
        })
    }

}