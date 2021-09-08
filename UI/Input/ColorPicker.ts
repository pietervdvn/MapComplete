import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";

export default class ColorPicker extends InputElement<string> {

    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly value: UIEventSource<string>
    private readonly _element: HTMLElement

    constructor(
        value: UIEventSource<string> = new UIEventSource<string>(undefined)
    ) {
        super();
        this.value = value;

        const el = document.createElement("input")
        this._element = el;

        el.type = "color"

        this.value.addCallbackAndRunD(v => {
            el.value = v
        });

        el.oninput = () => {
            const hex = el.value;
            value.setData(hex);
        }
    }

    GetValue(): UIEventSource<string> {
        return this.value;
    }

    IsValid(t: string): boolean {
        return false;
    }

    protected InnerConstructElement(): HTMLElement {
        return this._element;
    }

}