import {UIElement} from "../UIElement";
import {UIEventSource} from "../UIEventSource";
import {FixedUiElement} from "../Base/FixedUiElement";

export abstract class InputElement<T> extends UIElement{
    
    abstract GetValue() : UIEventSource<T>;
    
    abstract IsValid(t: T) : boolean;
    
}