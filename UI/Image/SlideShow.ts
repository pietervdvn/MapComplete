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

        el.onchange = () => {
            console.log("Parent is now ", el.parentElement)
        }

        const mutationObserver = new MutationObserver(mutations => {
            console.log("Mutations are: ", mutations)
            
            
            mutationObserver.disconnect()
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
        })

        mutationObserver.observe(el, {
            childList: true,
            characterData: true,
            subtree: true
        })


        this.embeddedElements.addCallbackAndRun(elements => {
            for (const element of elements ?? []) {
                element.SetClass("slick-carousel-content")
                el.appendChild(element.ConstructElement())
            }
        });

        return el;
    }

}