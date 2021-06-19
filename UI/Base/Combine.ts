import {FixedUiElement} from "./FixedUiElement";
import {Utils} from "../../Utils";
import BaseUIElement from "../BaseUIElement";

export default class Combine extends BaseUIElement {
    private readonly uiElements: BaseUIElement[];

    constructor(uiElements: (string | BaseUIElement)[]) {
        super();
        this.uiElements = Utils.NoNull(uiElements)
            .map(el => {
                if (typeof el === "string") {
                    return new FixedUiElement(el);
                }
                return el;
            });
    }
    
    protected InnerConstructElement(): HTMLElement {
        const el = document.createElement("span")

        try{
            
     
        for (const subEl of this.uiElements) {
            if(subEl === undefined || subEl === null){
                continue;
            }
            const subHtml = subEl.ConstructElement()
            if(subHtml !== undefined){
                el.appendChild(subHtml)
            }
        }
        }catch(e){
            const domExc = e as DOMException
            console.error("DOMException: ", domExc.name)
            el.appendChild(new FixedUiElement("Could not generate this combine!").SetClass("alert").ConstructElement())
        }
        
        return el;
    }
    
    AsMarkdown(): string {
        return this.uiElements.map(el => el.AsMarkdown()).join(this.HasClass("flex-col") ? "\n\n" : " ");
    }

}