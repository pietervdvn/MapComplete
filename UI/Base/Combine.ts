import {UIElement} from "../UIElement";
import Translations from "../i18n/Translations";

export default class Combine extends UIElement {
    private readonly uiElements: (string | UIElement)[];
    private readonly className: string = undefined;

    constructor(uiElements: (string | UIElement)[], className: string = undefined) {
        super(undefined);
        this.dumbMode = false;
        this.className = className;
        this.uiElements = uiElements;
        if (className) {
            console.error("Deprecated used of className")
        }
    }

    InnerRender(): string {
        let elements = "";
        for (const element of this.uiElements) {
            if(element === undefined){
                continue;
            }
            
            if (element instanceof UIElement) {
                elements += element.Render();
            } else {
                elements += element;
            }
        }
        if(this.className !== undefined){
            elements = `<span class='${this.className}'>${elements}</span>`;
        }
        
        return elements;
    }

    InnerUpdate(htmlElement: HTMLElement) {
        for (const element of this.uiElements) {
            if (element instanceof UIElement) {
                element.Update();
            }
        }
    }
}