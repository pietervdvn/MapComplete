import {UIElement} from "../UIElement";
import {InputElement} from "./InputElement";
import Translations from "../i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";

export class TextField extends InputElement<string> {
    private readonly value: UIEventSource<string>;
    public readonly enterPressed = new UIEventSource<string>(undefined);
    private readonly _placeholder: UIElement;
    public readonly IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly _htmlType: string;
    private readonly _inputMode : string;
    private readonly _textAreaRows: number;

    private readonly _isValid: (string,country) => boolean;
    private _label: UIElement;

    constructor(options?: {
        placeholder?: string | UIElement,
        value?: UIEventSource<string>,
        textArea?: boolean,
        htmlType?: string,
        inputMode?: string,
        label?: UIElement,
        textAreaRows?: number,
        isValid?: ((s: string, country?: () => string) => boolean)
    }) {
        super(undefined);
        const self = this;
        this.value = new UIEventSource<string>("");
        options = options ?? {};
        this._htmlType = options.textArea ? "area" : (options.htmlType ?? "text");
        this.value = options?.value ?? new UIEventSource<string>(undefined);

        this._label = options.label;
        this._textAreaRows = options.textAreaRows;
        this._isValid = options.isValid ?? ((str, country) => true);

        this._placeholder = Translations.W(options.placeholder ?? "");
        this._inputMode = options.inputMode;
        this.ListenTo(this._placeholder._source);

        this.onClick(() => {
            self.IsSelected.setData(true)
        });
        this.value.addCallback((t) => {
            const field = document.getElementById("txt-"+this.id);
            if (field === undefined || field === null) {
                return;
            }
            field.className = self.IsValid(t) ? "" : "invalid";

            if (t === undefined || t === null) {
                return;
            }
            // @ts-ignore
            field.value = t;
        });
        this.dumbMode = false;
    }

    GetValue(): UIEventSource<string> {
        return this.value;
    }

    InnerRender(): string {

        const placeholder = this._placeholder.InnerRender().replace("'", "&#39");
        if (this._htmlType === "area") {
            return `<span id="${this.id}"><textarea id="txt-${this.id}" placeholder='${placeholder}' class="form-text-field" rows="${this._textAreaRows}" cols="50" style="max-width: 100%; width: 100%; box-sizing: border-box"></textarea></span>`
        }

        let label = "";
        if (this._label != undefined) {
            label = this._label.Render();
        }
        let inputMode = ""
        if(this._inputMode !== undefined){
            inputMode = `inputmode="${this._inputMode}" `
        }
        return new Combine([
            `<span id="${this.id}">`,
            `<form onSubmit='return false' class='form-text-field'>`,
            label,
            `<input type='${this._htmlType}' ${inputMode} placeholder='${placeholder}' id='txt-${this.id}'/>`,
            `</form>`,
            `</span>`
        ]).Render();
    }
    
    InnerUpdate() {
        const field = document.getElementById("txt-" + this.id);
        const self = this;
        field.oninput = () => {
            
            // How much characters are on the right, not including spaces?
            // @ts-ignore
            const endDistance = field.value.substring(field.selectionEnd).replace(/ /g,'').length;
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
            while(newCursorPos >= 0 && 
                // We count the number of _actual_ characters (non-space characters) on the right of the new value
                // This count should become bigger then the end distance
                val.substr(newCursorPos).replace(/ /g, '').length < endDistance
                ){
                newCursorPos --;
            }
            // @ts-ignore
            self.SetCursorPosition(newCursorPos);
        };

        if (this.value.data !== undefined && this.value.data !== null) {
            // @ts-ignore
            field.value = this.value.data;
        }

        field.addEventListener("focusin", () => self.IsSelected.setData(true));
        field.addEventListener("focusout", () => self.IsSelected.setData(false));


        field.addEventListener("keyup", function (event) {
            if (event.key === "Enter") {
                // @ts-ignore
                self.enterPressed.setData(field.value);
            }
        });
        
    }

    public SetCursorPosition(i: number) {
        const field = document.getElementById('txt-' + this.id);
        if(field === undefined || field === null){
            return;
        }
        if (i === -1) {
            // @ts-ignore
            i = field.value.length;
        }
        field.focus();
        // @ts-ignore
        field.setSelectionRange(i, i);

    }

    IsValid(t: string): boolean {
        if (t === undefined || t === null) {
            return false
        }
        return this._isValid(t, undefined);
    }

}