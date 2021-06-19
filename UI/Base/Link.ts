import Translations from "../i18n/Translations";
import BaseUIElement from "../BaseUIElement";
import {UIEventSource} from "../../Logic/UIEventSource";


export default class Link extends BaseUIElement {
    private readonly _href: string | UIEventSource<string>;
    private readonly _embeddedShow: BaseUIElement;
    private readonly _newTab: boolean;

    constructor(embeddedShow: BaseUIElement | string, href: string | UIEventSource<string>, newTab: boolean = false) {
        super();
        this._embeddedShow =Translations.W(embeddedShow);
        this._href = href;
        this._newTab = newTab;

    }

    protected InnerConstructElement(): HTMLElement {
        const embeddedShow = this._embeddedShow?.ConstructElement();
        if(embeddedShow === undefined){
            return undefined;
        }
        const el = document.createElement("a")
        if(typeof this._href === "string"){
            el.href = this._href
        }else{
           this._href.addCallbackAndRun(href => {
                el.href = href;
            })
        }
        if (this._newTab) {
            el.target = "_blank"
        }
        el.appendChild(embeddedShow)
        return el;
    }

    AsMarkdown(): string {
        // @ts-ignore
        return `[${this._embeddedShow.AsMarkdown()}](${this._href.data ?? this._href})`;
    }

}