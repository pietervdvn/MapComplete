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

        for (const subEl of this.uiElements) {
            if(subEl === undefined || subEl === null){
                continue;
            }
            const subHtml = subEl.ConstructElement()
            if(subHtml !== undefined){
                el.appendChild(subHtml)
            }
        }
        
        return el;
    }
    
}