import {InputElement} from "./InputElement";
import {UIElement} from "../UIElement";
import {FixedUiElement} from "../Base/FixedUiElement";
import {UIEventSource} from "../../Logic/UIEventSource";

export class FixedInputElement<T> extends InputElement<T> {
    private readonly rendering: UIElement;
    private readonly value: UIEventSource<T>;
    public readonly IsSelected : UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly _comparator: (t0: T, t1: T) => boolean;

    constructor(rendering: UIElement | string, 
                value: T,
                comparator: ((t0: T, t1: T) => boolean ) = undefined) {
        super(undefined);
        this._comparator = comparator ?? ((t0, t1) => t0 == t1);
        this.value = new UIEventSource<T>(value);
        this.rendering = typeof (rendering) === 'string' ? new FixedUiElement(rendering) : rendering;
        const self = this;
        this.onClick(() => {
            self.IsSelected.setData(true)
        })
    }

    GetValue(): UIEventSource<T> {
        return this.value;
    }
    InnerRender(): string {
        return this.rendering.Render();
    }

    IsValid(t: T): boolean {
        return this._comparator(t, this.value.data);
    }

    protected InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        const self = this;
        htmlElement.addEventListener("mouseout", () => self.IsSelected.setData(false))

    }


}