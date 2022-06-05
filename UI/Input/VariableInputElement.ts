import {InputElement, ReadonlyInputElement} from "./InputElement";
import {Store} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";
import {VariableUiElement} from "../Base/VariableUIElement";

export default class VariableInputElement<T> extends BaseUIElement implements ReadonlyInputElement<T> {

    private readonly value: Store<T>;
    private readonly element: BaseUIElement
    private readonly upstream: Store<InputElement<T>>;

    constructor(upstream: Store<InputElement<T>>) {
        super()
        this.upstream = upstream;
        this.value = upstream.bind(v => v.GetValue())
        this.element = new VariableUiElement(upstream)
    }

    GetValue(): Store<T> {
        return this.value;
    }

    IsValid(t: T): boolean {
        return this.upstream.data.IsValid(t);
    }

    protected InnerConstructElement(): HTMLElement {
        return this.element.ConstructElement();
    }

}