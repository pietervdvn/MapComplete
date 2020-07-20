import {UIElement} from "../UIElement";
import {UIEventSource} from "../UIEventSource";

export class VariableUiElement extends UIElement {
    private _html: UIEventSource<string>;
    private _innerUpdate: (htmlElement: HTMLElement) => void;

    constructor(html: UIEventSource<string>, innerUpdate : ((htmlElement : HTMLElement) => void) = undefined) {
        super(html);
        this._html = html;
        this._innerUpdate = innerUpdate;

    }

    InnerRender(): string {
        return this._html.data;
    }
    
}