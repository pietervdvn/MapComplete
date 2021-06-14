import BaseUIElement from "../BaseUIElement";
import {Utils} from "../../Utils";
import Translations from "../i18n/Translations";

export default class Table extends BaseUIElement {

    private readonly _header: BaseUIElement[];
    private readonly _contents: BaseUIElement[][];

    constructor(header: (BaseUIElement | string)[], contents: (BaseUIElement | string)[][]) {
        super();
        this._header = header.map(Translations.W);
        this._contents = contents.map(row => row.map(Translations.W));
    }

    protected InnerConstructElement(): HTMLElement {
        const table = document.createElement("table")

        const headerElems = Utils.NoNull((this._header ?? []).map(elems => elems.ConstructElement()))
        if (headerElems.length > 0) {

            const tr = document.createElement("tr");
            headerElems.forEach(headerElem => {
                const td = document.createElement("th")
                td.appendChild(headerElem)
                tr.appendChild(td)
            })
            table.appendChild(tr)
        }

        for (const row of this._contents) {
            const tr = document.createElement("tr")
            for (const elem of row) {
                const htmlElem = elem.ConstructElement()
                if (htmlElem === undefined) {
                    continue;
                }

                const td = document.createElement("td")
                td.appendChild(htmlElem)
                tr.appendChild(td)
            }
            table.appendChild(tr)
        }

        return table;
    }
    
    AsMarkdown(): string {
        
        const headerMarkdownParts =  this._header.map(hel => hel?.AsMarkdown() ?? " ")
        const header =headerMarkdownParts.join(" | ");
        const headerSep = headerMarkdownParts.map(part => '-'.repeat(part.length + 2)).join("|")
        const table = this._contents.map(row => row.map(el => el.AsMarkdown()?? " ").join("|")).join("\n")
        
        return [header, headerSep, table, ""].join("\n")
    }

}