import Translations from "../i18n/Translations";
import BaseUIElement from "../BaseUIElement";

export class Button extends BaseUIElement {
    private _text: BaseUIElement;

    constructor(text: string | BaseUIElement, onclick: (() => void | Promise<void>)) {
        super();
        this._text = Translations.W(text);
        this.onClick(onclick)
    }

    protected InnerConstructElement(): HTMLElement {
        const el = this._text.ConstructElement();
        if (el === undefined) {
            return undefined;
        }
        const form = document.createElement("form")
        const button = document.createElement("button")
        button.type = "button"
        button.appendChild(el)
        form.appendChild(button)
        return form;
    }

}