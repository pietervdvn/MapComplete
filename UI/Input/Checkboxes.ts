import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {Utils} from "../../Utils";
import {UIElement} from "../UIElement";
import BaseUIElement from "../BaseUIElement";

/**
 * Supports multi-input
 */
export default class CheckBoxes extends InputElement<number[]> {
    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    private readonly value: UIEventSource<number[]>;
    private readonly _elements: BaseUIElement[]
    
    
private readonly _element : HTMLElement

    constructor(elements: BaseUIElement[]) {
        super();
        this._elements = Utils.NoNull(elements);
        this.value = new UIEventSource<number[]>([])
        
        
        const el = document.createElement()
        this._element = el;
        
    }

    protected InnerConstructElement(): HTMLElement {
        return this._element
    }


    IsValid(ts: number[]): boolean {
        return ts !== undefined;
        
    }

    GetValue(): UIEventSource<number[]> {
        return this.value;
    }


    private IdFor(i) {
        return 'checkmark-' + this.id + '-' + i;
    }

    InnerRender(): string {
        let body = "";
        for (let i = 0; i < this._elements.length; i++) {
            let el = this._elements[i];
            const htmlElement =
                `<input type="checkbox" id="${this.IdFor(i)}"><label for="${this.IdFor(i)}">${el.Render()}</label><br/>`;
            body += htmlElement;

        }
        
        return `<form id='${this.id}'>${body}</form>`;
    }

    protected InnerUpdate(htmlElement: HTMLElement) {
        const self = this;

        for (let i = 0; i < this._elements.length; i++) {
            const el = document.getElementById(this.IdFor(i));
            
            if(this.value.data.indexOf(i) >= 0){
                // @ts-ignore
                el.checked = true;
            }

            el.onchange = () => {
                const index = self.value.data.indexOf(i);
                // @ts-ignore
                if(el.checked && index < 0){
                    self.value.data.push(i);
                    self.value.ping();
                }else if(index >= 0){
                    self.value.data.splice(index,1);
                    self.value.ping();
                }
            }

        }


    }


}