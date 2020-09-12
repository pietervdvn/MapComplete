import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";

export class VariableUiElement extends UIElement {
    private _html: UIEventSource<string>;

    constructor(html: UIEventSource<string>) {
        super(html);
        this._html = html;
    }

    InnerRender(): string {
        return this._html.data;
    }

}