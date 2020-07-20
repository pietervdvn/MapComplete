import {UIElement} from "../UIElement";

export class VerticalCombine extends UIElement {
    private _elements: UIElement[];
    private _className: string;

    constructor(elements: UIElement[], className: string = undefined) {
        super(undefined);
        this._elements = elements;
        this._className = className;
    }

    protected InnerRender(): string {
        let html = "";
        for (const element of this._elements) {
            if (!element.IsEmpty()) {
                html += "<div>" + element.Render() + "</div>";
            }
        }
        if(html === ""){
            return "";
        }
        if (this._className === undefined) {
            return html;
        }
        return "<div class='"+this._className+"'>" + html + "</div>";
    }
}