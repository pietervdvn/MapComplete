import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";

export default class SimpleDatePicker extends InputElement<string> {

    private readonly value: UIEventSource<string>

    private readonly _element: HTMLElement;
    
    constructor(
        value?: UIEventSource<string>
    ) {
        super();
        this.value = value ?? new UIEventSource<string>(undefined);
        const self = this;
       
        const el = document.createElement("input")
        this._element = el;
        el.type = "date"
        el.oninput = () => {
            // Already in YYYY-MM-DD value! 
            self.value.setData(el.value);
        }


        this.value.addCallbackAndRunD(v => {
            el.value = v;
        });


    }

    protected InnerConstructElement(): HTMLElement {
        return this._element
    }
    GetValue(): UIEventSource<string> {
        return this.value;
    }

    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    IsValid(t: string): boolean {
        return false;
    }

}