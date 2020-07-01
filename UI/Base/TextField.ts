import {UIElement} from "../UIElement";
import {UIEventSource} from "../UIEventSource";


export class TextField extends UIElement {

    public value = new UIEventSource("");
    /**
     * Pings and has the value data
     */
    public enterPressed = new UIEventSource<string>(undefined);
    private _placeholder: UIEventSource<string>;

    constructor(placeholder : UIEventSource<string>) {
        super(placeholder);
        this._placeholder = placeholder;
    }

    protected InnerRender(): string {
        return "<form onSubmit='return false' class='form-text-field'>" +
            "<input type='text' placeholder='"+this._placeholder.data+"' id='text-" + this.id + "'>" +
            "</form>";
    }

    InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        const field = document.getElementById('text-' + this.id);
        const self = this;
        field.oninput = () => {
            self.value.setData(field.value);
        };

        field.addEventListener("keyup", function (event) {
            if (event.key === "Enter") {
                self.enterPressed.setData(field.value);
            }
        });
    }

    Clear() {
        const field = document.getElementById('text-' + this.id);
        if (field !== undefined) {
            field.value = "";
        }
    }
}