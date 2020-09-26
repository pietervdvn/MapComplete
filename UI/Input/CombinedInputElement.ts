import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import {UIElement} from "../UIElement";

export default class CombinedInputElement<T> extends InputElement<T> {
    private readonly _a: InputElement<T>;
    private readonly _b: UIElement;
    private readonly _combined: UIElement;
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

    InnerRender(): string {
        return this._combined.Render();
    }


    IsValid(t: T): boolean {
        return this._a.IsValid(t);
    }

}