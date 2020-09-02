import {UIElement} from "../UIElement";

export default class PageSplit extends UIElement{
    private _left: UIElement;
    private _right: UIElement;
    private _leftPercentage: number;
    
    constructor(left: UIElement, right:UIElement,
                leftPercentage: number = 50) {
        super();
        this._left = left;
        this._right = right;
        this._leftPercentage = leftPercentage;
    }
    
    InnerRender(): string {
        return `<span class="page-split" style="height: min-content"><span style="flex:0 0 ${this._leftPercentage}%">${this._left.Render()}</span><span style="flex: 0 0 ${100-this._leftPercentage}%">${this._right.Render()}</span></span>`;
    }
    
}