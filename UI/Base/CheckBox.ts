import {UIElement} from "../UIElement";
import {UIEventSource} from "../UIEventSource";


export class CheckBox extends UIElement{

    constructor(data: UIEventSource<boolean>) {
        super(data);
        
    }


    protected InnerRender(): string {
        return "";
    }
    
}