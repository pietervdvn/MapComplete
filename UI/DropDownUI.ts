import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";

export class DropDownUI extends UIElement {

    selectedElement: UIEventSource<string>
    private _label: string;
    private _values: { value: string; shown: string }[];

    constructor(label: string, values: { value: string, shown: string }[]) {
        super(undefined);
        this._label = label;
        this._values = values;
        this.selectedElement = new UIEventSource<string>(values[0].value);

    }


    protected InnerRender(): string {

        let options = "";
        for (const value of this._values) {
            options += "<option value='" + value.value + "'>" + value.shown + "</option>"
        }

        return "<form>" +
            "<label for='dropdown-" + this.id + "'>" + this._label + "</label>" +
            "<select name='dropdown-" + this.id + "' id='dropdown-" + this.id + "'>" +
            options +
            "</select>" +
            "</form>";
    }

    InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);

        const self = this;
        const e = document.getElementById("dropdown-" + this.id);
        e.onchange = function () {
            // @ts-ignore
            const selectedValue = e.options[e.selectedIndex].value;

            self.selectedElement.setData(selectedValue);
        }
    }

}