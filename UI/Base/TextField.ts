import {UIElement} from "../UIElement";
import {UIEventSource} from "../UIEventSource";
import {UIInputElement} from "./UIInputElement";


export class TextField<T> extends UIInputElement<T> {

    public value: UIEventSource<string> = new UIEventSource<string>("");
    /**
     * Pings and has the value data
     */
    public enterPressed = new UIEventSource<string>(undefined);
    private _placeholder: UIEventSource<string>;
    private _mapping: (string) => T;

    constructor(placeholder: UIEventSource<string>,
                mapping: ((string) => T)) {
        super(placeholder);
        this._placeholder = placeholder;
        this._mapping = mapping;
    }

    GetValue(): UIEventSource<T> {
        return this.value.map(this._mapping);
    }

    protected InnerRender(): string {
        return "<form onSubmit='return false' class='form-text-field'>" +
            "<input type='text' placeholder='" + (this._placeholder.data ?? "") + "' id='text-" + this.id + "'>" +
            "</form>";
    }

    InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
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