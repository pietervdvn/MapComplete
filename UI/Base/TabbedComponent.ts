import {UIElement} from "../UIElement";
import Translations from "../i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";

export class TabbedComponent extends UIElement {

    private headers: UIElement[] = [];
    private content: UIElement[] = [];

    constructor(elements: { header: UIElement | string, content: UIElement | string }[], openedTab : UIEventSource<number> = new UIEventSource<number>(0)) {
        super(openedTab);
        const self = this;
        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            this.headers.push(Translations.W(element.header).onClick(() => self._source.setData(i)));
            this.content.push(Translations.W(element.content));
        }
    }

    InnerRender(): string {
        let headerBar = "";
        for (let i = 0; i < this.headers.length; i++) {
            let header = this.headers[i];

            if (!this.content[i].IsEmpty()) {
                headerBar += `<div class=\'tab-single-header ${i == this._source.data ? 'tab-active' : 'tab-non-active'}\'>` +
                    header.Render() + "</div>"
            }
        }


        headerBar = "<div class='tabs-header-bar'>" + headerBar + "</div>"

        const content = this.content[this._source.data];
        return headerBar + "<div class='tab-content'>" + (content?.Render() ?? "") + "</div>";
    }

    protected InnerUpdate(htmlElement: HTMLElement) {
        
        super.InnerUpdate(htmlElement);
        this.content[this._source.data].Update();
    }

}