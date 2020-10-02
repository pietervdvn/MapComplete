import {UIElement} from "../../UIElement";

/**
 * A single opening hours range, shown on top of the OH-picker table
 */
export default class OpeningHoursRange extends UIElement{
    private _parentCell: HTMLElement;
    constructor(parentCell : HTMLElement) {
        super();
        this._parentCell = parentCell;

        
    }
    InnerRender(): string {
        this.SetStyle(`display:block;position:absolute;top:0;left:0;width:100%;background:blue;height:${this._parentCell.offsetHeight*2}px`)
        return "Hi";
    }

}