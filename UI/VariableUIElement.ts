import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";

export class VariableUiElement extends UIElement {
    private _html: UIEventSource<string>;

    constructor(html: UIEventSource<string>) {
        super(html);
        this._html = html;
    }

    protected InnerRender(): string {
        return this._html.data;
    }


}