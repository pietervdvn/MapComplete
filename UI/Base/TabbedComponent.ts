import {UIElement} from "../UIElement";
import Translations from "../i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "./Combine";

export class TabbedComponent extends UIElement {

    private readonly header: UIElement;
    private content: UIElement[] = [];

    constructor(elements: { header: UIElement | string, content: UIElement | string }[], openedTab: (UIEventSource<number> | number) = 0) {
        super(typeof (openedTab) === "number" ? new UIEventSource(openedTab) : (openedTab ?? new UIEventSource<number>(0)));
        const self = this;
        const tabs: UIElement[] = []

        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            const header = Translations.W(element.header).onClick(() => self._source.setData(i))
            const content = Translations.W(element.content)
            this.content.push(content);
            if (!this.content[i].IsEmpty()) {
                const tab = header.SetClass("block tab-single-header")
                tabs.push(tab)
            }
        }

        this.header = new Combine(tabs).SetClass("block tabs-header-bar")


    }

    InnerRender(): UIElement {

        const content = this.content[this._source.data];
        return new Combine([
            this.header,
            content.SetClass("tab-content"),
        ])
    }

}