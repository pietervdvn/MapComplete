import {UIElement} from "../UIElement";
import {UIEventSource} from "../UIEventSource";


export class CheckBox extends UIElement{
    private data: UIEventSource<boolean>;

    constructor(data: UIEventSource<boolean>) {
        super(data);
        this.data = data;
        
    }


    protected InnerRender(): string {
        return "Current val: "+this.data.data;
    }
    
}