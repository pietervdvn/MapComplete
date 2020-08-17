import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";


export class SimpleImageElement extends UIElement {

    constructor(source: UIEventSource<string>) {
        super(source);
    }

    InnerRender(): string {
        return "<img src='" + this._source.data + "' alt='img'>";
    }

}