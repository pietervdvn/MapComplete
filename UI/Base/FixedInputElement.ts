import {UIInputElement} from "./UIInputElement";
import {UIEventSource} from "../UIEventSource";
import {UIElement} from "../UIElement";
import {FixedUiElement} from "./FixedUiElement";


export class FixedInputElement<T> extends UIInputElement<T> {
    private rendering: UIElement;
    private value: UIEventSource<T>;

    constructor(rendering: UIElement | string, value: T) {
        super(undefined);
        this.value = new UIEventSource<T>(value);
        this.rendering = typeof (rendering) === 'string' ? new FixedUiElement(rendering) : rendering;
    }

    GetValue(): UIEventSource<T> {
        return this.value;
    }

    protected InnerRender(): string {
        return this.rendering.Render();
    }

}