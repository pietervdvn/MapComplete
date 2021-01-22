import {UIElement} from "../UIElement";

export class FixedUiElement extends UIElement {
    private _html: string;

    constructor(html: string) {
        super(undefined);
        this._html = html ?? "";
    }

    InnerRender(): string {
        return this._html;
    }

}