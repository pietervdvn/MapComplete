import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";

export default class FeatureSwitched extends UIElement{
    private readonly _upstream: UIElement;
    private readonly _swtch: UIEventSource<boolean>;
    
    constructor(upstream :UIElement,
                swtch: UIEventSource<boolean>) {
        super(swtch);
        this._upstream = upstream;
        this._swtch = swtch;
    }
    
    InnerRender(): string {
        if(this._swtch.data){
            return this._upstream.Render();
        }
        return "";
    }
    
}