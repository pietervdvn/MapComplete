import { Utils } from "../../Utils"
import BaseUIElement from "../BaseUIElement"

export default class Img extends BaseUIElement {
    private readonly _src: string
    private readonly _rawSvg: boolean
    private readonly _options: { readonly fallbackImage?: string }

    constructor(
        src: string,
        rawSvg = false,
        options?: {
            fallbackImage?: string
        }
    ) {
        super()
        if (src === undefined || src === "undefined") {
            throw "Undefined src for image"
        }
        this._src = src
        this._rawSvg = rawSvg
        this._options = options
    }

    static AsData(source: string) {
        if (Utils.runningFromConsole) {
            return source
        }
        try {
            return `data:image/svg+xml;base64,${btoa(source)}`
        } catch (e) {
            console.error("Cannot create an image for", source.slice(0, 100))
            console.trace("Cannot create an image for the given source string due to ", e)
            return ""
        }
    }

    static AsImageElement(source: string, css_class: string = "", style = ""): string {
        return `<img class="${css_class}" style="${style}" alt="" src="${Img.AsData(source)}">`
    }

    AsMarkdown(): string {
        if (this._rawSvg === true) {
            console.warn("Converting raw svgs to markdown is not supported")
            return undefined
        }
        let src = this._src
        if (this._src.startsWith("./")) {
            src = "https://mapcomplete.org/" + src
        }
        return "![](" + src + ")"
    }

    protected InnerConstructElement(): HTMLElement {
        const self = this
        if (this._rawSvg) {
            const e = document.createElement("div")
            e.innerHTML = this._src
            return e
        }

        const el = document.createElement("img")
        el.src = this._src
        el.onload = () => {
            el.style.opacity = "1"
        }
        el.onerror = () => {
            if (self._options?.fallbackImage) {
                if (el.src === self._options.fallbackImage) {
                    // Sigh... nothing to be done anymore
                    return
                }
                el.src = self._options.fallbackImage
            }
        }
        return el
    }
}
