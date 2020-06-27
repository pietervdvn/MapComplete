import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";

export class SlideShow extends UIElement {

    private readonly _embeddedElements: UIEventSource<UIElement[]>

    private readonly _currentSlide: UIEventSource<number> = new UIEventSource<number>(0);
    private readonly _noimages: UIElement;

    constructor(
        title: UIElement,
        embeddedElements: UIEventSource<UIElement[]>,
        noImages: UIElement) {
        super(embeddedElements);
        this._embeddedElements = embeddedElements;
        this.ListenTo(this._currentSlide);
        this._noimages = noImages;
    }

    protected InnerRender(): string {
        if (this._embeddedElements.data.length == 0) {
            return this._noimages.Render();
        }

        if (this._embeddedElements.data.length == 1) {
            return "<div class='image-slideshow'>"+this._embeddedElements.data[0].Render()+"</div>";
        }

        const prevBtn = "<div class='prev-button' id='prevbtn-"+this.id+"'></div>"
        const nextBtn = "<div class='next-button' id='nextbtn-"+this.id+"'></div>"

        let slides = ""
        for (let i = 0; i < this._embeddedElements.data.length; i++) {
            let embeddedElement = this._embeddedElements.data[i];
            let state = "hidden"
            if (this._currentSlide.data === i) {
                state = "active-slide";
            }
            slides += "      <div class=\"slide " + state + "\">" + embeddedElement.Render() + "</div>\n";
        }
        return "<div class='image-slideshow'>"
            + prevBtn
            + "<div class='slides'>" + slides + "</div>"
            + nextBtn
            + "</div>";
    }

    InnerUpdate(htmlElement) {
        const nextButton = document.getElementById("nextbtn-"+this.id);
        if(nextButton === undefined || nextButton === null){
            return;
        }
      
        const prevButton = document.getElementById("prevbtn-"+this.id);
        const self = this;
        nextButton.onclick = () => {
            const current = self._currentSlide.data;
            const next = (current + 1) % self._embeddedElements.data.length;
            self._currentSlide.setData(next);
        }
        prevButton.onclick = () => {
            const current = self._currentSlide.data;
            let prev = (current - 1);
            if (prev < 0) {
                prev = self._embeddedElements.data.length - 1;
            }
            self._currentSlide.setData(prev);
        }

    }

    Activate() {
        for (const embeddedElement of this._embeddedElements.data) {
            embeddedElement.Activate();
        }
    }

}