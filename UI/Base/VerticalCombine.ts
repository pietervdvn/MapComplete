import {UIElement} from "../UIElement";

export class VerticalCombine extends UIElement {
    private readonly _elements: UIElement[];

    constructor(elements: UIElement[]) {
        super(undefined);
        this._elements = elements;
    }

    InnerRender(): string {
        let html = "";
        for (const element of this._elements) {
            if (element !== undefined && !element.IsEmpty()) {
                html += "<div>" + element.Render() + "</div>";
            }
        }
        return html;
    }
}