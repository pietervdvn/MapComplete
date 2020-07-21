import {UIEventSource} from "./UIEventSource";
import {UIElement} from "./UIElement";
import Translations from "./i18n/Translations";

export class SaveButton extends UIElement {
    private _value: UIEventSource<any>;

    constructor(value: UIEventSource<any>) {
        super(value);
        if(value === undefined){
            throw "No event source for savebutton, something is wrong"
        }
        this._value = value;
    }

    InnerRender(): string {
        if (this._value.data === undefined ||
            this._value.data === null
            || this._value.data === ""
        ) {
            return "<span class='save-non-active'>"+Translations.t.general.save.Render()+"</span>"
        }
        return "<span class='save'>"+Translations.t.general.save.Render()+"</span>";
    }

}