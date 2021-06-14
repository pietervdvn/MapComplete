import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";
import $ from "jquery"

export class SlideShow extends BaseUIElement {


    private readonly embeddedElements: UIEventSource<BaseUIElement[]>;

    constructor(embeddedElements: UIEventSource<BaseUIElement[]>) {
        super()
        this.embeddedElements = embeddedElements;
    }

    protected InnerConstructElement(): HTMLElement {
        const el = document.createElement("div")
        el.classList.add("slic-carousel")

        this.embeddedElements.addCallbackAndRun(elements => {
            for (const element of elements ?? []) {
                element.SetClass("slick-carousel-content")
                el.appendChild(element.ConstructElement())
            }
        });

        return el;
    }

}