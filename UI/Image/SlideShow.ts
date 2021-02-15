import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import Combine from "../Base/Combine";
// @ts-ignore
import $ from "jquery"

export class SlideShow extends UIElement {

    private readonly _embeddedElements: UIEventSource<UIElement[]>

    constructor(
        embeddedElements: UIEventSource<UIElement[]>) {
        super(embeddedElements);
        this._embeddedElements = embeddedElements;
        this._embeddedElements.addCallbackAndRun(elements => {
            for (const element of elements ?? []) {
                element.SetClass("slick-carousel-content")
            }
        })

    }

    InnerRender(): string {
        return new Combine(
                this._embeddedElements.data,
            ).SetClass("block slick-carousel")
            .Render();
    }

    Update() {
        super.Update();
        for (const uiElement of this._embeddedElements.data) {
            uiElement.Update();
        }
    }

    protected InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        require("slick-carousel")
        if(this._embeddedElements.data.length == 0){
            return;
        }
        // @ts-ignore
        $('.slick-carousel').not('.slick-initialized').slick({
            autoplay: true,
            arrows: true,
            dots: true,
            lazyLoad: 'progressive',
            variableWidth: true,
            centerMode: true,
            centerPadding: "60px",
            adaptive: true  
        });
    }

}