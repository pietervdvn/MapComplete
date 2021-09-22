import {Utils} from "../../Utils";
import BaseUIElement from "../BaseUIElement";

export default class Img extends BaseUIElement {
    private _src: string;
    private readonly _rawSvg: boolean;
    private _options: { fallbackImage?: string };

    constructor(src: string, rawSvg = false, options?: {
        fallbackImage?: string
    }) {
        super();
        this._src = src;
        this._rawSvg = rawSvg;
        this._options = options;
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
        const self = this;
        if (this._rawSvg) {
            const e = document.createElement("div")
            e.innerHTML = this._src
            return e;
        }

        const el = document.createElement("img")
        el.src = this._src;
        el.onload = () => {
            el.style.opacity = "1"
        }
        el.onerror = () => {
            if (self._options?.fallbackImage) {
                if(el.src === self._options.fallbackImage){
                    // Sigh... nothing to be done anymore
                    return;
                }
                el.src = self._options.fallbackImage
            }
        }
        return el;
    }
}

