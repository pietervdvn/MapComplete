import {UIElement} from "../UIElement";
import Translations from "../i18n/Translations";


export default class Link extends UIElement {
    private readonly _embeddedShow: UIElement;
    private readonly _target: string;
    private readonly _newTab: string;

    constructor(embeddedShow: UIElement | string, target: string, newTab: boolean = false) {
        super();
        this._embeddedShow = Translations.W(embeddedShow);
        this._target = target;
        this._newTab = "";
        if (newTab) {
            this._newTab = "target='_blank'"
        }
    }

    InnerRender(): string {
        return `<a href="${this._target}" ${this._newTab}>${this._embeddedShow.Render()}</a>`;
    }

}