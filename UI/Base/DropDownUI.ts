import {UIEventSource} from "../UIEventSource";
import {UIElement} from "../UIElement";

export class DropDownUI extends UIElement {

    selectedElement: UIEventSource<string>
    private _label: string;
    private _values: { value: string; shown: string }[];

    constructor(label: string, values: { value: string, shown: string }[],
                selectedElement: UIEventSource<string> = undefined) {
        super(undefined);
        this._label = label;
        this._values = values;
        this.selectedElement = selectedElement ?? new UIEventSource<string>(values[0].value);
        if(selectedElement.data === undefined){
            this.selectedElement.setData(values[0].value)
        }
        const self = this;
        this.selectedElement.addCallback(() => {
            self.InnerUpdate();
        });
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

    InnerUpdate() {
        const self = this;
        const e = document.getElementById("dropdown-" + this.id);
        // @ts-ignore
        if (this.selectedElement.data !== e.value) {
            // @ts-ignore
            e.value = this.selectedElement.data;
        }
        e.onchange = function () {
            // @ts-ignore
            const selectedValue = e.options[e.selectedIndex].value;
            console.log("Putting data", selectedValue)
            self.selectedElement.setData(selectedValue);
        }
        
    }

}