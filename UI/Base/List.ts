import {Utils} from "../../Utils";
import BaseUIElement from "../BaseUIElement";
import Translations from "../i18n/Translations";

export default class List extends BaseUIElement {
    private readonly uiElements: BaseUIElement[];
    private readonly _ordered: boolean;

    constructor(uiElements: (string | BaseUIElement)[], ordered = false) {
        super();
        this._ordered = ordered;
        this.uiElements = Utils.NoNull(uiElements)
            .map(Translations.W);
    }

    protected InnerConstructElement(): HTMLElement {
        const el = document.createElement(this._ordered ? "ol" : "ul")

        for (const subEl of this.uiElements) {
            if(subEl === undefined || subEl === null){
                continue;
            }
            const subHtml = subEl.ConstructElement()
            if(subHtml !== undefined){
                const item = document.createElement("li")
                item.appendChild(subHtml)
                el.appendChild(item)
            }
        }

        return el;
    }
    
    AsMarkdown(): string {
        if(this._ordered){
            return "\n\n"+this.uiElements.map((el, i) => "  "+i+". "+el.AsMarkdown().replace(/\n/g, '  \n') ).join("\n") + "\n"
        }else{
            return "\n\n"+this.uiElements.map(el => "  - "+el.AsMarkdown().replace(/\n/g, '  \n') ).join("\n")+"\n"

        }
    }

}