import {UIElement} from "../UIElement";
import Translations from "../i18n/Translations";

export default class Combine extends UIElement {
    private uiElements: (string | UIElement)[];
    private className: string = undefined;
    private clas: string = undefined;

    constructor(uiElements: (string | UIElement)[], className: string = undefined) {
        super(undefined);
        this.className = className;
        this.uiElements = uiElements;
    }

    InnerRender(): string {
        let elements = "";
        for (const element of this.uiElements) {
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