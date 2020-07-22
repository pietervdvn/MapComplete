import {UIElement} from "../UIElement";

export class Button extends UIElement {
    private _text: UIElement;
    private _onclick: () => void;
    private _clss: string;

    constructor(text: UIElement, onclick: (() => void), clss: string = "") {
        super(undefined);
        this._text = text;
        this._onclick = onclick;
        if (clss !== "") {

            this._clss = "class='" + clss + "'";
        }else{
            this._clss = "";
        }
    }


    InnerRender(): string {

        return "<form>" +
            "<button id='button-"+this.id+"' type='button' "+this._clss+">" + this._text.Render() +  "</button>" +
            "</form>";
    }

    InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        const self = this;
        console.log("Update for ", htmlElement)
        document.getElementById("button-"+this.id).onclick = function(){
            console.log("Clicked");
            self._onclick();
        }
    }

}