import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import BaseUIElement from "../BaseUIElement";

export default class CombinedInputElement<T, J, X> extends InputElement<X> {

    public readonly IsSelected: UIEventSource<boolean>;
    private readonly _a: InputElement<T>;
    private readonly _b: InputElement<J>;
    private readonly _combined: BaseUIElement;
    private readonly _value: UIEventSource<X>
    private readonly _split: (x: X) => [T, J];

    constructor(a: InputElement<T>, b: InputElement<J>,
                combine: (t: T, j: J) => X,
                split: (x: X) => [T, J]) {
        super();
        this._a = a;
        this._b = b;
        this._split = split;
        this.IsSelected = this._a.IsSelected.map((isSelected) => {
            return isSelected || b.IsSelected.data
        }, [b.IsSelected])
        this._combined = new Combine([this._a, this._b]);
        this._value = this._a.GetValue().map(
            t => combine(t, this._b?.GetValue()?.data),
            [this._b.GetValue()],
        )
            .addCallback(x => {
                const [t, j] = split(x)
                this._a.GetValue()?.setData(t)
                this._b.GetValue()?.setData(j)
            })
    }

    GetValue(): UIEventSource<X> {
        return this._value;
    }

    IsValid(x: X): boolean {
        const [t, j] = this._split(x)
        return this._a.IsValid(t) && this._b.IsValid(j);
    }

    protected InnerConstructElement(): HTMLElement {
        return this._combined.ConstructElement();
    }

}