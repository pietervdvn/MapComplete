import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";

export class VariableUiElement extends BaseUIElement {

    private _element : HTMLElement;
    
    constructor(contents: UIEventSource<string | BaseUIElement>) {
        super();
        
        this._element = document.createElement("span")
        const el = this._element
        contents.addCallbackAndRun(contents => {
            while(el.firstChild){
                el.removeChild(
                    el.lastChild
                )
            }
            
            if(contents === undefined){
                return
            }
            if(typeof contents === "string"){
                el.innerHTML = contents
            }else{
                el.appendChild(contents.ConstructElement())
            }
        })
    }

    protected InnerConstructElement(): HTMLElement {
        return this._element;
    }

}