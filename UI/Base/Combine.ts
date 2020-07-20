import {UIElement} from "../UIElement";
import Translations from "../i18n/Translations";

export default class Combine extends UIElement {
    private uiElements: UIElement[];

    constructor(uiElements: (string | UIElement)[]) {
        super(undefined);
        this.uiElements = uiElements.map(Translations.W);
    }

    InnerRender(): string {
        let elements = "";
        for (const element of this.uiElements) {
            elements += element.Render();
        }
        return elements;
    }
}