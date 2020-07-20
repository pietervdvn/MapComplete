import {UIElement} from "../UIElement";
import {UIEventSource} from "../UIEventSource";
import {UIInputElement} from "./UIInputElement";


export class TextField<T> extends UIInputElement<T> {

    private value: UIEventSource<string>;
    private mappedValue: UIEventSource<T>;
    /**
     * Pings and has the value data
     */
    public enterPressed = new UIEventSource<string>(undefined);
    private _placeholder: UIEventSource<string>;
    private _pretext: string;
    private _fromString: (string: string) => T;

    constructor(options: {
        placeholder?: UIEventSource<string>,
        toString: (t: T) => string,
        fromString: (string: string) => T,
        pretext?: string,
        value?: UIEventSource<T>
    }) {
        super(options?.placeholder);
        this.value = new UIEventSource<string>("");
        this.mappedValue = options?.value ?? new UIEventSource<T>(undefined);


        this.value.addCallback((str) => this.mappedValue.setData(options.fromString(str)));
        this.mappedValue.addCallback((t) => this.value.setData(options.toString(t)));


        this._placeholder = options?.placeholder ?? new UIEventSource<string>("");
        this._pretext = options?.pretext ?? "";

        const self = this;
        this.mappedValue.addCallback((t) => {
            if (t === undefined && t === null) {
                return;
            }
            const field = document.getElementById('text-' + this.id);
            if (field === undefined && field === null) {
                return;
            }
            field.value = options.toString(t);
        })
    }

    GetValue(): UIEventSource<T> {
        return this.mappedValue;
    }

    protected InnerRender(): string {
        return this._pretext + "<form onSubmit='return false' class='form-text-field'>" +
            "<input type='text' placeholder='" + (this._placeholder.data ?? "") + "' id='text-" + this.id + "'>" +
            "</form>";
    }

    InnerUpdate(htmlElement: HTMLElement) {
        const field = document.getElementById('text-' + this.id);
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


    }

    Clear() {
        const field = document.getElementById('text-' + this.id);
        if (field !== undefined) {
            // @ts-ignore
            field.value = "";
        }
    }
}