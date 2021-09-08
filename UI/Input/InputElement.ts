import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";

export abstract class InputElement<T> extends BaseUIElement {

    abstract IsSelected: UIEventSource<boolean>;

    abstract GetValue(): UIEventSource<T>;

    abstract IsValid(t: T): boolean;

}

