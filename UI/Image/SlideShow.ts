import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import Combine from "../Base/Combine";
import Svg from "../../Svg";

export class SlideShow extends UIElement {

    private readonly _embeddedElements: UIEventSource<UIElement[]>

    public readonly _currentSlide: UIEventSource<number> = new UIEventSource<number>(0);
    private _prev: UIElement;
    private _next: UIElement;

    constructor(
        embeddedElements: UIEventSource<UIElement[]>) {
        super(embeddedElements);
        this._embeddedElements = embeddedElements;
        this.ListenTo(this._currentSlide);
        this._embeddedElements
            .stabilized(1000)
            .addCallback(embedded => {
                // Always move to the last image - but at most once per second
                this._currentSlide.setData(this._embeddedElements.data.length - 1);
            });

        this.dumbMode = false;
        const self = this;
        this._prev = new Combine([
            "<div class='vspan'></div>",
            Svg.arrow_left_smooth_img])
            .SetClass("prev-button")
            .onClick(() => {
                const current = self._currentSlide.data;
                self.MoveTo(current - 1);
            });
        this._next = new Combine([
            "<div class='vspan'></div>",
            Svg.arrow_right_smooth_img])
            .SetClass("next-button")
            .onClick(() => {
                const current = self._currentSlide.data;
                self.MoveTo(current + 1);
            });

    }

    InnerRender(): string {
        if (this._embeddedElements.data.length == 0) {
            return "";
        }

        if (this._embeddedElements.data.length == 1) {
            return "<div class='image-slideshow'><div class='slides'><div class='slide'>" +
                this._embeddedElements.data[0].Render() +
                "</div></div></div>";
        }


        let slides = ""
        for (let i = 0; i < this._embeddedElements.data.length; i++) {
            let embeddedElement = this._embeddedElements.data[i];
            let state = "hidden"
            if (this._currentSlide.data === i) {
                state = "active-slide";
            }
            slides += "      <div class=\"slide " + state + "\">" + embeddedElement.Render() + "</div>\n";
        }
        return new Combine([
             this._prev
            , "<div class='slides'>", slides, "</div>"
            , this._next])
            .SetClass('image-slideshow')
            .Render();
    }

    public MoveTo(index: number) {
        if (index < 0) {
            index = this._embeddedElements.data.length - 1;
        }
        index = index % this._embeddedElements.data.length;
        this._currentSlide.setData(index);
    }
    
    Update() {
        super.Update();
        for (const uiElement of this._embeddedElements.data) {
            uiElement.Update();
        }
    }

}