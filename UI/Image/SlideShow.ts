import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";

export class SlideShow extends BaseUIElement {


    private  readonly _element: HTMLElement;
    
    constructor(
        embeddedElements: UIEventSource<BaseUIElement[]>) {
        super()
        
        const el = document.createElement("div")
        this._element = el;
        
        el.classList.add("slick-carousel")
        require("slick-carousel")
        // @ts-ignore
        el.slick({
            autoplay: true,
            arrows: true,
            dots: true,
            lazyLoad: 'progressive',
            variableWidth: true,
            centerMode: true,
            centerPadding: "60px",
            adaptive: true
        });
        embeddedElements.addCallbackAndRun(elements => {
            for (const element of elements ?? []) {
                element.SetClass("slick-carousel-content")
            }
        });

    }

    protected InnerConstructElement(): HTMLElement {
        return this._element;
    }

}