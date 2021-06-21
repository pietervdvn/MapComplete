import BaseUIElement from "../BaseUIElement";
import {Utils} from "../../Utils";
import Translations from "../i18n/Translations";

export default class Table extends BaseUIElement {

    private readonly _header: BaseUIElement[];
    private readonly _contents: BaseUIElement[][];
    private readonly _contentStyle: string[][];

    constructor(header: (BaseUIElement | string)[],
                contents: (BaseUIElement | string)[][],
                contentStyle?: string[][]) {
        super();
        this._contentStyle = contentStyle ?? [];
        this._header = header?.map(Translations.W);
        this._contents = contents.map(row => row.map(Translations.W));
    }

    AsMarkdown(): string {

        const headerMarkdownParts = this._header.map(hel => hel?.AsMarkdown() ?? " ")
        const header = headerMarkdownParts.join(" | ");
        const headerSep = headerMarkdownParts.map(part => '-'.repeat(part.length + 2)).join(" | ")
        const table = this._contents.map(row => row.map(el => el.AsMarkdown() ?? " ").join(" | ")).join("\n")

        return "\n\n" + [header, headerSep, table, ""].join("\n")
    }

    protected InnerConstructElement(): HTMLElement {
        const table = document.createElement("table")

        const headerElems = Utils.NoNull((this._header ?? []).map(elems => elems.ConstructElement()))
        if (headerElems.length > 0) {

            const thead = document.createElement("thead")

            const tr = document.createElement("tr");
            headerElems.forEach(headerElem => {
                const td = document.createElement("th")
                td.appendChild(headerElem)
                tr.appendChild(td)
            })
            thead.appendChild(tr)
            table.appendChild(thead)

        }

        for (let i = 0; i < this._contents.length; i++) {
            let row = this._contents[i];
            const tr = document.createElement("tr")
            for (let j = 0; j < row.length; j++) {
                let elem = row[j];
                const htmlElem = elem?.ConstructElement()
                if (htmlElem === undefined) {
                    continue;
                }

                let style = undefined;
                if (this._contentStyle !== undefined && this._contentStyle[i] !== undefined && this._contentStyle[j] !== undefined) {
                    style = this._contentStyle[i][j]
                }

                const td = document.createElement("td")
                td.style.cssText = style;
                td.appendChild(htmlElem)
                tr.appendChild(td)
            }
            table.appendChild(tr)
        }

        return table;
    }

}