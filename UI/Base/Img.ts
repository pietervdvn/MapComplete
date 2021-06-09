import {Utils} from "../../Utils";
import BaseUIElement from "../BaseUIElement";

export default class Img extends BaseUIElement {
    private _src: string;

    constructor(src: string) {
        super();
        this._src = src;
    }

    static AsData(source: string) {
        if (Utils.runningFromConsole) {
            return source;
        }
        return `data:image/svg+xml;base64,${(btoa(source))}`;
    }

    static AsImageElement(source: string, css_class: string = "", style = ""): string {
        return `<img class="${css_class}" style="${style}" alt="" src="${Img.AsData(source)}">`;
    }

    protected InnerConstructElement(): HTMLElement {
        const el = document.createElement("img")
        el.src = this._src;
        return el;
    }
}

