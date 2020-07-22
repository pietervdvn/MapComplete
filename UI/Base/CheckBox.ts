import {UIElement} from "../UIElement";
import {UIEventSource} from "../UIEventSource";
import { FilteredLayer } from "../../Logic/FilteredLayer";


export class CheckBox extends UIElement{

    private readonly _data: UIEventSource<boolean>;
    private readonly _showEnabled: string|UIElement;
    private readonly _showDisabled: string|UIElement;

    constructor(data: UIEventSource<boolean>, showEnabled: string|UIElement, showDisabled: string|UIElement) {
        super(data);
        this._data = data;
        this._showEnabled = showEnabled;
        this._showDisabled = showDisabled;
        this.onClick(() => {
            data.setData(!data.data);
            
        })
        
    }

    protected InnerRender(): string {
        if (this._data.data) {
            return this._showEnabled;
        } else {
            return this._showDisabled;
        }
    }
    
}