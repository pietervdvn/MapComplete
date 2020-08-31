import SingleSetting from "./SingleSetting";
import {UIElement} from "../UIElement";
import {FixedUiElement} from "../Base/FixedUiElement";
import {InputElement} from "../Input/InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import {VariableUiElement} from "../Base/VariableUIElement";

export default class SettingsTable extends UIElement {

    private _col1: UIElement[] = [];
    private _col2: InputElement<any>[] = [];

    public selectedSetting: UIEventSource<SingleSetting<any>>;

    constructor(elements: SingleSetting<any>[],
                currentSelectedSetting: UIEventSource<SingleSetting<any>>) {
        super(undefined);
        const self = this;
        this.selectedSetting = currentSelectedSetting ?? new UIEventSource<SingleSetting<any>>(undefined);
        for (const element of elements) {
            let title: UIElement = new FixedUiElement(element._name);
            this._col1.push(title);
            this._col2.push(element._value);
            element._value.IsSelected.addCallback(isSelected => {
                if (isSelected) {
                    self.selectedSetting.setData(element);
                } else if (self.selectedSetting.data === element) {
                    self.selectedSetting.setData(undefined);
                }
            })
        }

    }

    InnerRender(): string {
        let html = "";

        for (let i = 0; i < this._col1.length; i++) {
            html += `<tr><td>${this._col1[i].Render()}</td><td>${this._col2[i].Render()}</td></tr>`
        }

        return `<table><tr>${html}</tr></table>`;
    }

}