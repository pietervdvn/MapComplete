import {InputElement} from "./InputElement";
import {UIElement} from "../UIElement";
import {FixedUiElement} from "../Base/FixedUiElement";
import {UIEventSource} from "../../Logic/UIEventSource";

export class FixedInputElement<T> extends InputElement<T> {
    private readonly rendering: UIElement;
    private readonly value: UIEventSource<T>;
    public readonly IsSelected : UIEventSource<boolean> = new UIEventSource<boolean>(false);

    constructor(rendering: UIElement | string, value: T) {
        super(undefined);
        this.value = new UIEventSource<T>(value);
        this.rendering = typeof (rendering) === 'string' ? new FixedUiElement(rendering) : rendering;
    }

    GetValue(): UIEventSource<T> {
        return this.value;
    }
    InnerRender(): string {
        return this.rendering.Render();
    }

    IsValid(t: T): boolean {
        return t == this.value.data;
    }

    protected InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        const self = this;
        htmlElement.addEventListener("mouseenter", () => self.IsSelected.setData(true));
        htmlElement.addEventListener("mouseout", () => self.IsSelected.setData(false))

    }


}