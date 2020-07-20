import {InputElement} from "./InputElement";
import {UIEventSource} from "../UIEventSource";
import {UIElement} from "../UIElement";
import {FixedUiElement} from "../Base/FixedUiElement";


export class FixedInputElement<T> extends InputElement<T> {
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
    
    ShowValue(t: T): boolean {
        return false;
    }

    InnerRender(): string {
        return this.rendering.Render();
    }

    IsValid(t: T): boolean {
        return t == this.value.data;
    }
    
    

}