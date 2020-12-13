import SingleSetting from "./SingleSetting";
import {UIElement} from "../UIElement";
import {FixedUiElement} from "../Base/FixedUiElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import PageSplit from "../Base/PageSplit";
import Combine from "../Base/Combine";

export default class SettingsTable extends UIElement {

    private _col1: UIElement[] = [];
    private _col2: UIElement[] = [];

    public selectedSetting: UIEventSource<SingleSetting<any>>;

    constructor(elements: (SingleSetting<any> | string)[],
                currentSelectedSetting?: UIEventSource<SingleSetting<any>>) {
        super(undefined);
        const self = this;
        this.selectedSetting = currentSelectedSetting ?? new UIEventSource<SingleSetting<any>>(undefined);
        for (const element of elements) {
            if(typeof element === "string"){
                this._col1.push(new FixedUiElement(element));
                this._col2.push(null);
                continue;
            }
            
            let title: UIElement = element._name === undefined ? null : new FixedUiElement(element._name);
            this._col1.push(title);
            this._col2.push(element._value);
            element._value.SetStyle("display:block");
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
        let elements = [];

        for (let i = 0; i < this._col1.length; i++) {
            if(this._col1[i] !== null && this._col2[i] !== null){
                elements.push(new PageSplit(this._col1[i], this._col2[i], 25));
            }else if(this._col1[i] !== null){
                elements.push(this._col1[i])
            }else{
                elements.push(this._col2[i])
            }
        }

        return new Combine(elements).Render();
    }
    
}