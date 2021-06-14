import BaseUIElement from "../BaseUIElement";

export class FixedUiElement extends BaseUIElement {
    private _html: string;

    constructor(html: string) {
        super();
        this._html = html ?? "";
    }
    
    InnerRender(): string {
        return this._html;
    }

    protected InnerConstructElement(): HTMLElement {
        const e = document.createElement("span")
        e.innerHTML = this._html
        return e;
    }
    
    AsMarkdown(): string {
        return this._html;
    }

}