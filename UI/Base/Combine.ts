import {UIElement} from "../UIElement";
import {FixedUiElement} from "./FixedUiElement";
import {Utils} from "../../Utils";

export default class Combine extends UIElement {
    private readonly uiElements: UIElement[];

    constructor(uiElements: (string | UIElement)[]) {
        super();
        this.uiElements = Utils.NoNull(uiElements)
            .map(el => {
                if (typeof el === "string") {
                    return new FixedUiElement(el);
                }
                return el;
            });
    }

    InnerRender(): string {
        return this.uiElements.map(ui => ui.Render()).join("");
    }

}