import {UIElement} from "../UIElement";
import {UIEventSource} from "../UIEventSource";
import { FilteredLayer } from "../../Logic/FilteredLayer";


export class CheckBox extends UIElement{
    private data: UIEventSource<boolean>;

    constructor(data: UIEventSource<boolean>, name: String) {
        super(data);
        this.data = data;
        this.name = name
    }

    protected InnerRender(): string {
        return `${this.data.data? `<svg class="checkbox__check" width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 8L11.5 17L25.5 3" stroke="#003B8B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg><p class="checkbox__label--checked">${this.name}</p>`: `<p class="checkbox__label--unchecked">${this.name}</p>`}`;
    }
    
}