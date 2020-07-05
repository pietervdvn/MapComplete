import {UIElement} from "../UIElement";
import {UIEventSource} from "../UIEventSource";

export abstract class UIInputElement<T> extends UIElement{
    
    abstract GetValue() : UIEventSource<T>;
    
}