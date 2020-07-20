import {UIElement} from "../UIElement";
import {UIEventSource} from "../UIEventSource";
import {InputElement} from "./InputElement";
import {FixedUiElement} from "../Base/FixedUiElement";


export class TextField<T> extends InputElement<T> {

    private value: UIEventSource<string>;
    private mappedValue: UIEventSource<T>;
    /**
     * Pings and has the value data
     */
    public enterPressed = new UIEventSource<string>(undefined);
    private _placeholder: UIElement;
    private _fromString?: (string: string) => T;
    private _toString: (t: T) => string;

    constructor(options: {
        placeholder?: string | UIElement,
        toString: (t: T) => string,
        fromString: (string: string) => T,
        value?: UIEventSource<T>
    }) {
        super(undefined);
        this.value = new UIEventSource<string>("");
        this.mappedValue = options?.value ?? new UIEventSource<T>(undefined);


        // @ts-ignore
        this._fromString = options.fromString ?? ((str) => (str))
        this.value.addCallback((str) => this.mappedValue.setData(options.fromString(str)));
        this.mappedValue.addCallback((t) => this.value.setData(options.toString(t)));


        options.placeholder = options.placeholder ?? "";
        if (options.placeholder instanceof UIElement) {
            this._placeholder = options.placeholder
        } else {
            this._placeholder = new FixedUiElement(options.placeholder);
        }
        this._toString = options.toString ?? ((t) => ("" + t));


        const self = this;
        this.mappedValue.addCallback((t) => {
            if (t === undefined || t === null) {
                return;
            }
            const field = document.getElementById('text-' + this.id);
            if (field === undefined || field === null) {
                return;
            }
            // @ts-ignore
            field.value = options.toString(t);
        })
    }

    GetValue(): UIEventSource<T> {
        return this.mappedValue;
    }

    ShowValue(t: T): boolean {
        if (!this.IsValid(t)) {
            return false;
        }
        this.mappedValue.setData(t);
    }

    InnerRender(): string {
        return "<form onSubmit='return false' class='form-text-field'>" +
            "<input type='text' placeholder='" + this._placeholder.InnerRender() + "' id='text-" + this.id + "'>" +
            "</form>";
    }

    InnerUpdate(htmlElement: HTMLElement) {
        const field = document.getElementById('text-' + this.id);
        if (field === null) {
            return;
        }
        const self = this;
        field.oninput = () => {
            // @ts-ignore
            self.value.setData(field.value);
        };

        field.addEventListener("keyup", function (event) {
            if (event.key === "Enter") {
                // @ts-ignore
                self.enterPressed.setData(field.value);
            }
        });

        if (this.IsValid(this.mappedValue.data)) {
            // @ts-ignore
            field.value = this._toString(this.mappedValue.data);
        }


    }

    IsValid(t: T): boolean {
        console.log("TXT IS valid?",t,this._toString(t))
        if(t === undefined || t === null){
            return false;
        }
        const result = this._toString(t);
        return result !== undefined && result !== null;
    }

    Clear() {
        const field = document.getElementById('text-' + this.id);
        if (field !== undefined) {
            // @ts-ignore
            field.value = "";
        }
    }
}