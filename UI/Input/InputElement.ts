import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";

export abstract class InputElement<T> extends BaseUIElement {


    abstract GetValue(): UIEventSource<T>;

    abstract IsValid(t: T): boolean;

}
