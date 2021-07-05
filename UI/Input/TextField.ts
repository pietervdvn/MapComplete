import {InputElement} from "./InputElement";
import Translations from "../i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";

export class TextField extends InputElement<string> {
    public readonly enterPressed = new UIEventSource<string>(undefined);
    public readonly IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly value: UIEventSource<string>;
    private _element: HTMLElement;
    private readonly _isValid: (s: string, country?: () => string) => boolean;

    constructor(options?: {
        placeholder?: string | BaseUIElement,
        value?: UIEventSource<string>,
        htmlType?: string,
        inputMode?: string,
        label?: BaseUIElement,
        textAreaRows?: number,
        inputStyle?: string,
        isValid?: ((s: string, country?: () => string) => boolean)
    }) {
        super();
        const self = this;
        options = options ?? {};
        this.value = options?.value ?? new UIEventSource<string>(undefined);
        this._isValid = options.isValid ?? (_ => true);

        this.onClick(() => {
            self.IsSelected.setData(true)
        });


        const placeholder = Translations.W(options.placeholder ?? "").ConstructElement().innerText.replace("'", "&#39");

        this.SetClass("form-text-field")
        let inputEl: HTMLElement
        if (options.htmlType === "area") {
            const el = document.createElement("textarea")
            el.placeholder = placeholder
            el.rows = options.textAreaRows
            el.cols = 50
            el.style.cssText = "max-width: 100%; width: 100%; box-sizing: border-box"
            inputEl = el;
        } else {
            const el = document.createElement("input")
            el.type = options.htmlType ?? "text"
            el.inputMode = options.inputMode
            el.placeholder = placeholder
            el.style.cssText = options.inputStyle
            inputEl = el
        }

        const form = document.createElement("form")
        form.appendChild(inputEl)
        form.onsubmit = () => false;

        if (options.label) {
            form.appendChild(options.label.ConstructElement())
        }

        this._element = form;

        const field = inputEl;


        this.value.addCallbackAndRunD(value => {
                // We leave the textfield as is in the case of undefined or null (handled by addCallbackAndRunD) - make sure we do not erase it!
            field["value"] = value;
            if (self.IsValid(value)) {
                self.RemoveClass("invalid")
            } else {
                self.SetClass("invalid")
            }

        })

        field.oninput = () => {

            // How much characters are on the right, not including spaces?
            // @ts-ignore
            const endDistance = field.value.substring(field.selectionEnd).replace(/ /g, '').length;
            // @ts-ignore
            let val: string = field.value;
            if (!self.IsValid(val)) {
                self.value.setData(undefined);
            } else {
                self.value.setData(val);
            }
            // Setting the value might cause the value to be set again. We keep the distance _to the end_ stable, as phone number formatting might cause the start to change
            // See https://github.com/pietervdvn/MapComplete/issues/103
            // We reread the field value - it might have changed!

            // @ts-ignore
            val = field.value;
            let newCursorPos = val.length - endDistance;
            while (newCursorPos >= 0 &&
                // We count the number of _actual_ characters (non-space characters) on the right of the new value
                // This count should become bigger then the end distance
                val.substr(newCursorPos).replace(/ /g, '').length < endDistance
                ) {
                newCursorPos--;
            }
            // @ts-ignore
            TextField.SetCursorPosition(field, newCursorPos);
        };


        field.addEventListener("focusin", () => self.IsSelected.setData(true));
        field.addEventListener("focusout", () => self.IsSelected.setData(false));


        field.addEventListener("keyup", function (event) {
            if (event.key === "Enter") {
                // @ts-ignore
                self.enterPressed.setData(field.value);
            }
        });


    }

    private static SetCursorPosition(textfield: HTMLElement, i: number) {
        if (textfield === undefined || textfield === null) {
            return;
        }
        if (i === -1) {
            // @ts-ignore
            i = textfield.value.length;
        }
        textfield.focus();
        // @ts-ignore
        textfield.setSelectionRange(i, i);

    }

    GetValue(): UIEventSource<string> {
        return this.value;
    }

    IsValid(t: string): boolean {
        if (t === undefined || t === null) {
            return false
        }
        return this._isValid(t, undefined);
    }

    protected InnerConstructElement(): HTMLElement {
        return this._element;
    }

}