import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import BaseUIElement from "../BaseUIElement";

export default class CombinedInputElement<T> extends InputElement<T> {
    protected InnerConstructElement(): HTMLElement {
       return this._combined.ConstructElement();
    }
    private readonly _a: InputElement<T>;
    private readonly _b: BaseUIElement;
    private readonly _combined: BaseUIElement;
    public readonly IsSelected: UIEventSource<boolean>;
    constructor(a: InputElement<T>, b: InputElement<T>) {
        super();
        this._a = a;
        this._b = b;
        this.IsSelected = this._a.IsSelected.map((isSelected) => {
            return isSelected || b.IsSelected.data
        }, [b.IsSelected])
        this._combined = new Combine([this._a, this._b]);
    }

    GetValue(): UIEventSource<T> {
        return this._a.GetValue();
    }

    IsValid(t: T): boolean {
        return this._a.IsValid(t);
    }

}