import {UIElement} from "../UIElement";


export default class Link extends UIElement {
    private readonly _embeddedShow: UIElement;
    private readonly _target: string;
    private readonly _newTab: string;

    constructor(embeddedShow: UIElement, target: string, newTab: boolean = false) {
        super();
        this._embeddedShow = embeddedShow;
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