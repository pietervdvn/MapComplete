import BaseUIElement from "../BaseUIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "./Combine";
import Title from "./Title";
import Hash from "../../Logic/Web/Hash";

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

    constructor(title: Title | Combine | BaseUIElement, content: BaseUIElement, options?: {
        closeOnClick: true | boolean
    }) {
        super([title, content])
        content.SetClass("animate-height border-l-4 pl-2 block")
        title.SetClass("background-subtle rounded-lg")
        const self = this
        this.onClick(() => {
            if(self.isVisible.data){
                if(options?.closeOnClick ?? true){
                    self.isVisible.setData(false)
                }
            }else{
                self.isVisible.setData(true)
            }
        })
        const contentElement = content.ConstructElement()
        
        if(title instanceof Combine){
            for(const el of title.getElements()){
                if(el instanceof Title){
                    title = el;
                    break;
                }
            }
        }

        if (title instanceof Title) {
            Hash.hash.addCallbackAndRun(h => {
                if (h === (<Title> title).id) {
                    self.isVisible.setData(true)
                    content.RemoveClass("border-gray-300")
                    content.SetClass("border-red-300")
                } else {
                    content.SetClass("border-gray-300")
                    content.RemoveClass("border-red-300")
                }
            })
            this.isVisible.addCallbackAndRun(isVis => {
                if (isVis) {
                    Hash.hash.setData((<Title>title).id)
                }
            })
        }

        this.isVisible.addCallbackAndRun(isVisible => {
            if (isVisible) {
                contentElement.style.maxHeight = "100vh"
                contentElement.style.overflowY = "auto"
                contentElement.style["-webkit-mask-image"] = "unset"
            } else {
                contentElement.style["-webkit-mask-image"] = "-webkit-gradient(linear, left top, left bottom, from(rgba(0,0,0,1)), to(rgba(0,0,0,0)))"
                contentElement.style.maxHeight = "2rem"
            }
        })
    }

    public Collapse() : Toggleable{
        this.isVisible.setData(false)
        return this;
    }
    
}