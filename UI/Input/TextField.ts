import {UIElement} from "../UIElement";
import {InputElement} from "./InputElement";
import Translations from "../i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";

export class TextField extends InputElement<string> {
    private readonly value: UIEventSource<string>;
    public readonly enterPressed = new UIEventSource<string>(undefined);
    private readonly _placeholder: UIElement;
    public readonly IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly _isArea: boolean;
    private readonly _textAreaRows: number;

    constructor(options?: {
        placeholder?: string | UIElement,
        value?: UIEventSource<string>,
        textArea?: boolean,
        textAreaRows?: number,
        isValid?: ((s: string) => boolean)
    }) {
        super(undefined);
        const self = this;
        this.value = new UIEventSource<string>("");
        options = options ?? {};
        this._isArea = options.textArea ?? false;
        this.value = options?.value ?? new UIEventSource<string>(undefined);

        // @ts-ignore
        this._fromString = options.fromString ?? ((str) => (str))
        this._textAreaRows = options.textAreaRows;

        this._placeholder = Translations.W(options.placeholder ?? "");
        this.ListenTo(this._placeholder._source);

        this.onClick(() => {
            self.IsSelected.setData(true)
        });
        this.value.addCallback((t) => {
            const field = document.getElementById(this.id);
            if (field === undefined || field === null) {
                return;
            }
            if (options.isValid) {
                field.className = options.isValid(t) ? "" : "invalid";
            }

            if (t === undefined || t === null) {
                // @ts-ignore
                return;
            }
            // @ts-ignore
            field.value = t;
        });
        this.dumbMode = false;
        this.SetClass("deadbeef")
    }

    GetValue(): UIEventSource<string> {
        return this.value;
    }

    InnerRender(): string {

        if (this._isArea) {
            return `<span id="${this.id}"><textarea id="txt-${this.id}" class="form-text-field" rows="${this._textAreaRows}" cols="50" style="max-width: 100%; width: 100%; box-sizing: border-box"></textarea></span>`
        }

        const placeholder = this._placeholder.InnerRender().replace("'", "&#39");

        return `<span id="${this.id}"><form onSubmit='return false' class='form-text-field'>` +
            `<input type='text' placeholder='${placeholder}' id='txt-${this.id}'>` +
            `</form></span>`;
    }
    
    Update() {
        console.log("Updating TF")
        super.Update();
    }

    InnerUpdate() {
        console.log("Inner Updating TF")
        const field = document.getElementById("txt-" + this.id);
        const self = this;
        field.oninput = () => {
            // @ts-ignore
            self.value.setData(field.value);
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
        const field = document.getElementById('text-' + this.id);
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
        return !(t === undefined || t === null);
    }

}
                