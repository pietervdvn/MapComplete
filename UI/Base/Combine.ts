import {UIElement} from "../UIElement";
import Translations from "../i18n/Translations";

export default class Combine extends UIElement {
    private uiElements: (string | UIElement)[];

    constructor(uiElements: (string | UIElement)[]) {
        super(undefined);
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