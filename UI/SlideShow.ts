import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";

export class SlideShow extends UIElement {

    private readonly _embeddedElements: UIEventSource<UIElement[]>

    private readonly _currentSlide: UIEventSource<number> = new UIEventSource<number>(0);
    private readonly _title: UIElement;
    private readonly _noimages: UIElement;

    constructor(
        title: UIElement,
        embeddedElements: UIEventSource<UIElement[]>,
        noImages: UIElement) {
        super(embeddedElements);
        this._title = title;
        this._embeddedElements = embeddedElements;
        this.ListenTo(this._currentSlide);
        this._noimages = noImages;
    }

    protected InnerRender(): string {
        if (this._embeddedElements.data.length == 0) {
            return this._noimages.Render();
        }
        const prevBtn = "<input class='prev-button' type='button' onclick='console.log(\"prev\")' value='<' />"
        const nextBtn = "<input class='next-button' type='button' onclick='console.log(\"nxt\")' value='>' />"
        let header = this._title.Render();
        if (this._embeddedElements.data.length > 1) {
            header = header + prevBtn + (this._currentSlide.data + 1) + "/" + this._embeddedElements.data.length + nextBtn;
        }
        let body = ""
        for (let i = 0; i < this._embeddedElements.data.length; i++) {
            let embeddedElement = this._embeddedElements.data[i];
            let state = "hidden"
            if (this._currentSlide.data === i) {
                state = "active-slide";
            }
            body += "      <div class=\"slide " + state + "\">" + embeddedElement.Render() + "</div>\n";
        }
        return "<span class='image-slideshow'>" + header + body + "</span>";
    }

    InnerUpdate(htmlElement) {
        const nextButton = htmlElement.getElementsByClassName('next-button')[0];
        if(nextButton === undefined){
            return;
        }
        const prevButton = htmlElement.getElementsByClassName('prev-button')[0];
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