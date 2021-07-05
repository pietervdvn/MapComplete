import Translations from "../i18n/Translations";
import BaseUIElement from "../BaseUIElement";

export class Button extends BaseUIElement {
    private _text: BaseUIElement;
    private _onclick: () => void;

    constructor(text: string | BaseUIElement, onclick: (() => void)) {
        super();
        this._text = Translations.W(text);
        this._onclick = onclick;
    }

    protected InnerConstructElement(): HTMLElement {
        const el = this._text.ConstructElement();
        if(el === undefined){
            return undefined;
        }
        const form = document.createElement("form")
        const button = document.createElement("button")
        button.type = "button"
        button.appendChild(el)
        button.onclick = this._onclick
        form.appendChild(button)
        return form;
    }

}