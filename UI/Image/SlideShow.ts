import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";
import {Utils} from "../../Utils";
import Combine from "../Base/Combine";

export class SlideShow extends BaseUIElement {


    private readonly embeddedElements: UIEventSource<BaseUIElement[]>;

    constructor(embeddedElements: UIEventSource<BaseUIElement[]>) {
        super()
        this.embeddedElements =embeddedElements;
    }

    protected InnerConstructElement(): HTMLElement {
        const el = document.createElement("div")
        el.style.overflowX = "auto"
        el.style.width = "min-content"
        el.style.minWidth = "min-content"
        el.style.display = "flex"

        this.embeddedElements.addCallbackAndRun(elements => {
            while (el.firstChild) {
                el.removeChild(el.lastChild)
            }

            elements = Utils.NoNull(elements).map(el => new Combine([el]) 
                .SetClass("block relative ml-1 bg-gray-200 m-1 rounded slideshow-item")
                .SetStyle("min-width: 150px; width: max-content; height: var(--image-carousel-height);max-height: var(--image-carousel-height);")
            )
            
            for (const element of elements ?? []) {
                el.appendChild(element.ConstructElement())
            }
        });

        const wrapper = document.createElement("div")
        wrapper.style.maxWidth = "100%"
        wrapper.style.overflowX = "auto"
        wrapper.appendChild(el)
        return wrapper;
    }

}