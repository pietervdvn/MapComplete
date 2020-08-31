import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";

export abstract class InputElement<T> extends UIElement{
    
    abstract GetValue() : UIEventSource<T>;
    abstract IsSelected: UIEventSource<boolean>;
    abstract IsValid(t: T) : boolean;
    
}

