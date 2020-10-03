import {UIElement} from "../UIElement";
import {InputElement} from "./InputElement";
import Translations from "../i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";

export class NumberField extends InputElement<number> {
    private readonly value: UIEventSource<number>;
    public readonly enterPressed = new UIEventSource<string>(undefined);
    private readonly _placeholder: UIElement;
    private options?: {
        placeholder?: string | UIElement,
        value?: UIEventSource<number>,
        isValid?: ((i: number) => boolean),
        min?: number,
        max?: number
    };
    public readonly IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly _isValid: (i:number) => boolean;

    constructor(options?: {
        placeholder?: string | UIElement,
        value?: UIEventSource<number>,
        isValid?: ((i:number) => boolean),
        min?: number,
        max?:number
    }) {
        super(undefined);
        this.options = options;
        const self = this;
        this.value = new UIEventSource<number>(undefined);
        this.value = options?.value ?? new UIEventSource<number>(undefined);

        this._isValid = options.isValid ?? ((i) => true);

        this._placeholder = Translations.W(options.placeholder ?? "");
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

    GetValue(): UIEventSource<number> {
        return this.value;
    }

    InnerRender(): string {

        const placeholder = this._placeholder.InnerRender().replace("'", "&#39");
        
        let min =  "";
        if(this.options.min){
            min = `min='${this.options.min}'`;
        }

        let max =  "";
        if(this.options.min){
            max = `max='${this.options.max}'`;
        }

        return `<span id="${this.id}"><form onSubmit='return false' class='form-text-field'>` +
            `<input type='number' ${min} ${max} placeholder='${placeholder}' id='txt-${this.id}'>` +
            `</form></span>`;
    }
    
    InnerUpdate() {
        const field = document.getElementById("txt-" + this.id);
        const self = this;
        field.oninput = () => {
            
            // How much characters are on the right, not including spaces?
            // @ts-ignore
            const endDistance = field.value.substring(field.selectionEnd).replace(/ /g,'').length;
            // @ts-ignore
            let val: number = Number(field.value);
            if (!self.IsValid(val)) {
                self.value.setData(undefined);
            } else {
                self.value.setData(val);
            }
   
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

    IsValid(t: number): boolean {
        if (t === undefined || t === null) {
            return false
        }
        return this._isValid(t);
    }

}