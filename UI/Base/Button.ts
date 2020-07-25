import {UIElement} from "../UIElement";
import Locale from "../i18n/Locale";
import Translations from "../i18n/Translations";

export class Button extends UIElement {
    private _text: UIElement;
    private _onclick: () => void;
    private _clss: string;

    constructor(text: string | UIElement, onclick: (() => void), clss: string = "") {
        super(Locale.language);
        this._text = Translations.W(text);
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
        document.getElementById("button-"+this.id).onclick = function(){
            self._onclick();
        }
    }

}