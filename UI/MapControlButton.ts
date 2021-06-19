import {UIElement} from "./UIElement";
import BaseUIElement from "./BaseUIElement";
import Combine from "./Base/Combine";

/**
 * A button floating above the map, in a uniform style
 */
export default class MapControlButton extends UIElement {
    private _contents: BaseUIElement;
    
    constructor(contents: BaseUIElement) {
        super();
        this._contents = new Combine([contents]);
        this.SetClass("relative block rounded-full w-10 h-10 p-1 pointer-events-auto z-above-map subtle-background")
        this.SetStyle("box-shadow: 0 0 10px var(--shadow-color);");
    }
    
    InnerRender() {
        return this._contents;
    }
    
}