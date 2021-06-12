import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {Utils} from "../../Utils";
import BaseUIElement from "../BaseUIElement";

/**
 * Supports multi-input
 */
export default class CheckBoxes extends InputElement<number[]> {
    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    
private readonly _element : HTMLElement
    
    private static _nextId = 0;
private readonly value: UIEventSource<number[]>
    constructor(elements: BaseUIElement[], value =new UIEventSource<number[]>([])) {
        super();
        this.value = value;
        elements = Utils.NoNull(elements);
        
        const el = document.createElement("form")
     
        for (let i = 0; i < elements.length; i++) {
           
            let inputI = elements[i];
            const input = document.createElement("input")
            const id = CheckBoxes._nextId
            CheckBoxes._nextId ++;
            input.id = "checkbox"+id

            input.type = "checkbox"
            const label = document.createElement("label")
            label.htmlFor = input.id
            label.appendChild(inputI.ConstructElement())

            value.addCallbackAndRun(selectedValues =>{
                if(selectedValues === undefined){
                    return;
                }
                if(selectedValues.indexOf(i) >= 0){
                    input.checked = true;
                }
            })

            input.onchange = () => {
                const index = value.data.indexOf(i);
                if(input.checked && index < 0){
                    value.data.push(i);
                    value.ping();
                }else if(index >= 0){
                    value.data.splice(index,1);
                    value.ping();
                }
            }


            el.appendChild(input)
            el.appendChild(document.createElement("br"))
        }


        
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




}