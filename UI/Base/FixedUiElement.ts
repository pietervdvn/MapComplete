import BaseUIElement from "../BaseUIElement";

export class FixedUiElement extends BaseUIElement {
    public readonly content: string;

    constructor(html: string) {
        super();
        this.content = html ?? "";
    }

    InnerRender(): string {
        return this.content;
    }

    AsMarkdown(): string {
        return this.content;
    }

    protected InnerConstructElement(): HTMLElement {
        const e = document.createElement("span")
        e.innerHTML = this.content
        return e;
    }
    

}