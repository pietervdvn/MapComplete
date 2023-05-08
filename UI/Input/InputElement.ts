import { Store, UIEventSource } from "../../Logic/UIEventSource"
import BaseUIElement from "../BaseUIElement"

/**
 * @deprecated
 */
export interface ReadonlyInputElement<T> extends BaseUIElement {
    GetValue(): Store<T>
    IsValid(t: T): boolean
}

/**
 * @deprecated
 */
export abstract class InputElement<T> extends BaseUIElement implements ReadonlyInputElement<any> {
    abstract GetValue(): UIEventSource<T>
    abstract IsValid(t: T): boolean
}
