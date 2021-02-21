import {UIElement} from "./UIElement";

/**
 * A button floating above the map, in a uniform style
 */
export default class MapControlButton extends UIElement {
    private _contents: UIElement;
    
    constructor(contents: UIElement) {
        super();
        this._contents = contents;
        this.SetClass("relative block rounded-full w-10 h-10 p-1 pointer-events-auto z-above-map subtle-background")
        this.SetStyle("box-shadow: 0 0 10px var(--shadow-color);");
    }
    
    InnerRender(): string {
        return this._contents.Render();
    }
    
}