import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import doc = Mocha.reporters.doc;

export default class Slider extends InputElement<number> {

    private readonly _value: UIEventSource<number>
    private min: number;
    private max: number;
    private step: number;

    /**
     * Constructs a slider input element for natural numbers
     * @param min: the minimum value that is allowed, inclusive
     * @param max: the max value that is allowed, inclusive
     * @param options: value: injectable value; step: the step size of the slider
     */
    constructor(min: number, max: number, options?: {
        value?: UIEventSource<number>,
        step?: 1 | number
    }) {
        super();
        this.max = max;
        this.min = min;
        this._value = options?.value ?? new UIEventSource<number>(min)
        this.step = options?.step ?? 1;
    }

    GetValue(): UIEventSource<number> {
        return this._value;
    }

    protected InnerConstructElement(): HTMLElement {
        const el = document.createElement("input")
        el.type = "range"
        el.min = "" + this.min
        el.max = "" + this.max
        el.step = "" + this.step
        const valuestore = this._value
        el.oninput = () => {
            valuestore.setData(Number(el.value))
        }
        valuestore.addCallbackAndRunD(v => el.value = ""+valuestore.data)
        return el;
    }

    IsValid(t: number): boolean {
        return Math.round(t) == t && t >= this.min && t <= this.max;
    }

}