import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";

export class SlideShow extends BaseUIElement {


    private readonly embeddedElements: UIEventSource<BaseUIElement[]>;

    constructor(embeddedElements: UIEventSource<BaseUIElement[]>) {
        super()
        this.embeddedElements = embeddedElements;
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

            for (const element of elements ?? []) {
                element
                    .SetClass("block ml-1; bg-gray-200")
                    .SetStyle("min-width: 150;  max-height: var(--image-carousel-height); min-height: var(--image-carousel-height)")

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