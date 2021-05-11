import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {Utils} from "../../Utils";

export default class ColorPicker extends InputElement<string> {

    private readonly value: UIEventSource<string>

    constructor(
        value?: UIEventSource<string>
    ) {
        super();
        this.value = value ?? new UIEventSource<string>(undefined);
        const self = this;
        this.value.addCallbackAndRun(v => {
            if(v === undefined){
                return;
            }
            self.SetValue(v);
        });
    }


    InnerRender(): string {
        return `<span id="${this.id}"><input type='color' id='color-${this.id}'></span>`;
    }
    
    private SetValue(color: string){
        const field = document.getElementById("color-" + this.id);
        if (field === undefined || field === null) {
            return;
        }
        // @ts-ignore
        field.value = color;
    }

    protected InnerUpdate() {
        const field = document.getElementById("color-" + this.id);
        if (field === undefined || field === null) {
            return;
        }
        const self = this;
        field.oninput = () => {
            const hex = field["value"];
            self.value.setData(hex);
        }

    }

    GetValue(): UIEventSource<string> {
        return this.value;
    }

    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    IsValid(t: string): boolean {
        return false;
    }

}