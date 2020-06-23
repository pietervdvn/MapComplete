import {UIElement} from "./UIElement";

export class VerticalCombine extends UIElement {
    private _elements: UIElement[];
    
    constructor(elements: UIElement[]) {
        super(undefined);
        this._elements = elements;
    }

    protected InnerRender(): string {
        let html = "";
        for (const element of this._elements){
            if (!element.IsEmpty()) {
                html += "<div>" + element.Render() + "</div><br />";
            }
        } 
        return html;
    }
    InnerUpdate(htmlElement: HTMLElement) {
    }
    
    Activate() {
        for (const element of this._elements){
            element.Activate();
        }
    }

}