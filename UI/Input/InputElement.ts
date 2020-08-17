import {UIElement} from "../UIElement";
import {FixedUiElement} from "../Base/FixedUiElement";
import {UIEventSource} from "../../Logic/UIEventSource";
export abstract class InputElement<T> extends UIElement{
    
    abstract GetValue() : UIEventSource<T>;
    
    abstract IsValid(t: T) : boolean;
    
}

