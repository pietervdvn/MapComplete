import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";


export default class InputElementMap<T, X> extends InputElement<X> {

    private readonly _inputElement: InputElement<T>;
    private isSame: (x0: X, x1: X) => boolean;
    private readonly fromX: (x: X) => T;
    private readonly toX: (t: T) => X;
    private readonly _value: UIEventSource<X>;

    constructor(inputElement: InputElement<T>,
                isSame: (x0: X, x1: X) => boolean,
                toX: (t: T) => X,
                fromX: (x: X) => T
    ) {
        super();
        this.isSame = isSame;
        this.fromX = fromX;
        this.toX = toX;
        this._inputElement = inputElement;
        this.IsSelected = inputElement.IsSelected;
        const self = this;
        this._value = inputElement.GetValue().map(
            (t => {
                const currentX = self.GetValue()?.data;
                const newX = toX(t);
                if (isSame(currentX, newX)) {
                    return currentX;
                }
                return newX;
            }), [], x => {
                const newT = fromX(x);
                return newT;
            });
    }

    GetValue(): UIEventSource<X> {
        return this._value;
    }

    InnerRender(): string {
        return this._inputElement.InnerRender();
    }

    IsSelected: UIEventSource<boolean>;

    IsValid(x: X): boolean {
        return this._inputElement.IsValid(this.fromX(x));
    }

}