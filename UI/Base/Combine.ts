import {FixedUiElement} from "./FixedUiElement";
import {Utils} from "../../Utils";
import BaseUIElement from "../BaseUIElement";
import Title from "./Title";

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

    AsMarkdown(): string {
        return this.uiElements.map(el => el.AsMarkdown()).join(this.HasClass("flex-col") ? "\n\n" : " ");
    }

    protected InnerConstructElement(): HTMLElement {
        const el = document.createElement("span")
        try {
            for (const subEl of this.uiElements) {
                if (subEl === undefined || subEl === null) {
                    continue;
                }
                try {

                    const subHtml = subEl.ConstructElement()
                    if (subHtml !== undefined) {
                        el.appendChild(subHtml)
                    }
                } catch (e) {
                    console.error("Could not generate subelement in combine due to ", e)
                }
            }
        } catch (e) {
            const domExc = e as DOMException
            console.error("DOMException: ", domExc.name)
            el.appendChild(new FixedUiElement("Could not generate this combine!").SetClass("alert").ConstructElement())
        }

        return el;
    }
    
    public getElements():  BaseUIElement[]{
        return this.uiElements
    }
    


}