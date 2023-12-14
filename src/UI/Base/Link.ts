import Translations from "../i18n/Translations"
import BaseUIElement from "../BaseUIElement"
import { Store } from "../../Logic/UIEventSource"

export default class Link extends BaseUIElement {
    private readonly _href: string | Store<string>
    private readonly _embeddedShow: BaseUIElement
    private readonly _newTab: boolean
    private readonly _download: string

    constructor(
        embeddedShow: BaseUIElement | string,
        href: string | Store<string>,
        newTab: boolean = false,
        download: string = undefined
    ) {
        super()
        this._download = download
        this._embeddedShow = Translations.W(embeddedShow)
        this._href = href
        this._newTab = newTab
        if (this._embeddedShow === undefined) {
            throw "Error: got a link where embeddedShow is undefined"
        }
        this.onClick(() => {})
    }

    public static OsmWiki(key: string, value?: string, hideKey = false) {
        if (value !== undefined) {
            let k = ""
            if (!hideKey) {
                k = key + "="
            }
            return new Link(
                k + value,
                `https://wiki.openstreetmap.org/wiki/Tag:${key}%3D${value}`,
                true
            )
        }
        return new Link(key, "https://wiki.openstreetmap.org/wiki/Key:" + key, true)
    }

    AsMarkdown(): string {
        // @ts-ignore
        return `[${this._embeddedShow.AsMarkdown()}](${this._href.data ?? this._href})`
    }

    protected InnerConstructElement(): HTMLElement {
        const embeddedShow = this._embeddedShow?.ConstructElement()
        if (embeddedShow === undefined) {
            return undefined
        }
        const el = document.createElement("a")
        if (typeof this._href === "string") {
            el.setAttribute("href", this._href)
        } else {
            this._href.addCallbackAndRun((href) => {
                el.setAttribute("href", href)
            })
        }
        if (this._newTab) {
            el.target = "_blank"
        }
        if (this._download) {
            el.setAttribute("download", this._download)
        }
        el.appendChild(embeddedShow)
        return el
    }
}
