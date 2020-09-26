import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";

export default class SimpleDatePicker extends InputElement<string> {

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
        return `<span id="${this.id}"><input type='date' id='date-${this.id}'></span>`;
    }
    
    private SetValue(date: string){
        const field = document.getElementById("date-" + this.id);
        if (field === undefined || field === null) {
            return;
        }
        // @ts-ignore
        field.value = date;
    }

    protected InnerUpdate() {
        const field = document.getElementById("date-" + this.id);
        if (field === undefined || field === null) {
            return;
        }
        const self = this;
        field.oninput = () => {
            // Already in YYYY-MM-DD value! 
            // @ts-ignore
            self.value.setData(field.value);
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