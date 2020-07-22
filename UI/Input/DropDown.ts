import {UIEventSource} from "../UIEventSource";
import {UIElement} from "../UIElement";
import {InputElement} from "./InputElement";
import instantiate = WebAssembly.instantiate;
import {FixedUiElement} from "../Base/FixedUiElement";
import Translations from "../i18n/Translations";

export class DropDown<T> extends InputElement<T> {

    private readonly _label: UIElement;
    private readonly _values: { value: T; shown: UIElement }[];

    private readonly _value;

    constructor(label: string | UIElement,
                values: { value: T, shown: string | UIElement }[],
                value: UIEventSource<T> = undefined) {
        super(undefined);
        this._value = value ?? new UIEventSource<T>(undefined);
        this._label = Translations.W(label);
        this._values = values.map(v => {
                return {
                    value: v.value,
                    shown: Translations.W(v.shown)
                }
            }
        );
        for (const v of this._values) {
            this.ListenTo(v.shown._source);
        }
        this.ListenTo(this._value);
        
        this.onClick(() => {}) // by registering a click, the click event is consumed and doesn't bubble furter to other elements, e.g. checkboxes
        

    }

    GetValue(): UIEventSource<T> {
        return this._value;
    }

    ShowValue(t: T): boolean {
        if (!this.IsValid(t)) {
            return false;
        }
        this._value.setData(t);
    }

    IsValid(t: T): boolean {
        for (const value of this._values) {
            if (value.value === t) {
                return true;
            }
        }
        return false
    }


    InnerRender(): string {
        if(this._values.length <=1){
            return "";
        }
        
        let options = "";
        for (let i = 0; i < this._values.length; i++) {
            options += "<option value='" + i + "'>" + this._values[i].shown.InnerRender() + "</option>"

        }
        return "<form>" +
            "<label for='dropdown-" + this.id + "'>" + this._label.Render() + "</label>" +
            "<select name='dropdown-" + this.id + "' id='dropdown-" + this.id + "'>" +
            options +
            "</select>" +
            "</form>";
    }

    protected InnerUpdate(element) {
       

        var e = document.getElementById("dropdown-" + this.id);
        if(e === null){
            return;
        }
        const self = this;
        e.onchange = (() => {
            // @ts-ignore
            var index = parseInt(e.selectedIndex);
            self._value.setData(self._values[index].value);

        });
        
        

        var t = this._value.data;
        for (let i = 0; i < this._values.length ; i++) {
            const value = this._values[i];
            if (value.value == t) {
                // @ts-ignore
                e.selectedIndex = i;
            }
        }

    }

}