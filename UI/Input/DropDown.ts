import {UIElement} from "../UIElement";
import {InputElement} from "./InputElement";
import Translations from "../i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";

export class DropDown<T> extends InputElement<T> {

    private readonly _label: UIElement;
    private readonly _values: { value: T; shown: UIElement }[];

    private readonly _value: UIEventSource<T>;

    public IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly _label_class: string;
    private readonly _select_class: string;
    private _form_style: string;

    constructor(label: string | UIElement,
                values: { value: T, shown: string | UIElement }[],
                value: UIEventSource<T> = undefined,
                label_class: string = "",
                select_class: string = "",
                form_style: string = "flex") {
        super(undefined);
        this._form_style = form_style;
        this._value = value ?? new UIEventSource<T>(undefined);
        this._label = Translations.W(label);
        this._label_class = label_class || '';
        this._select_class = select_class || '';
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

        return `<form class="${this._form_style}">` +
            `<label class='${this._label_class}' for='dropdown-${this.id}'>${this._label.Render()}</label>` +
            `<select class='${this._select_class}' name='dropdown-${this.id}' id='dropdown-${this.id}'>` +
            options +
            `</select>` +
            `</form>`;
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
            const value = this._values[i].value;
            if (value === t) {
                // @ts-ignore
                e.selectedIndex = i;
            }
        }
    }
}