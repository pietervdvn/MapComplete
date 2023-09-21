import BaseUIElement from "../BaseUIElement"
import { Utils } from "../../Utils"
import Translations from "../i18n/Translations"
import { UIEventSource } from "../../Logic/UIEventSource"

export default class Table extends BaseUIElement {
    private readonly _header: BaseUIElement[]
    private readonly _contents: BaseUIElement[][]
    private readonly _contentStyle: string[][]
    private readonly _sortable: boolean

    constructor(
        header: (BaseUIElement | string)[],
        contents: (BaseUIElement | string)[][],
        options?: {
            contentStyle?: string[][]
            sortable?: false | boolean
        }
    ) {
        super()
        this._contentStyle = options?.contentStyle ?? [["min-width: 9rem"]]
        this._header = header?.map(Translations.W)
        this._contents = contents.map((row) => row.map(Translations.W))
        this._sortable = options?.sortable ?? false
    }

    AsMarkdown(): string {
        const headerMarkdownParts = this._header.map((hel) => hel?.AsMarkdown() ?? " ")
        const header = Utils.NoNull(headerMarkdownParts).join(" | ")
        const headerSep = headerMarkdownParts.map((part) => "-".repeat(part.length + 2)).join(" | ")
        const table = this._contents
            .map((row) =>
                row
                    .map(
                        (el) =>
                            el?.AsMarkdown()?.replaceAll("\\", "\\\\")?.replaceAll("|", "\\|") ??
                            " "
                    )
                    .join(" | ")
            )
            .join("\n")

        return "\n\n" + [header, headerSep, table, ""].join("\n")
    }

    protected InnerConstructElement(): HTMLElement {
        const table = document.createElement("table")

        /**
         * Sortmode: i: sort column i ascending;
         * if i is negative : sort column (-i - 1) descending
         */
        const sortmode = new UIEventSource<number>(undefined)
        const self = this
        const headerElems = Utils.NoNull(
            (this._header ?? []).map((elem, i) => {
                if (self._sortable) {
                    elem.onClick(() => {
                        const current = sortmode.data
                        if (current == i) {
                            sortmode.setData(-1 - i)
                        } else {
                            sortmode.setData(i)
                        }
                    })
                }
                return elem.ConstructElement()
            })
        )
        if (headerElems.length > 0) {
            const thead = document.createElement("thead")

            const tr = document.createElement("tr")
            headerElems.forEach((headerElem) => {
                const td = document.createElement("th")
                td.appendChild(headerElem)
                tr.appendChild(td)
            })
            thead.appendChild(tr)
            table.appendChild(thead)
        }

        for (let i = 0; i < this._contents.length; i++) {
            let row = this._contents[i]
            const tr = document.createElement("tr")
            for (let j = 0; j < row.length; j++) {
                try {
                    let elem = row[j]
                    if (elem?.ConstructElement === undefined) {
                        continue
                    }
                    const htmlElem = elem?.ConstructElement()
                    if (htmlElem === undefined) {
                        continue
                    }

                    let style = undefined
                    if (
                        this._contentStyle !== undefined &&
                        this._contentStyle[i] !== undefined &&
                        this._contentStyle[j] !== undefined
                    ) {
                        style = this._contentStyle[i][j]
                    }

                    const td = document.createElement("td")
                    td.style.cssText = style
                    td.appendChild(htmlElem)
                    tr.appendChild(td)
                } catch (e) {
                    console.error("Could not render an element in a table due to", e, row[j])
                }
            }
            table.appendChild(tr)
        }

        sortmode.addCallback((sortCol) => {
            if (sortCol === undefined) {
                return
            }
            const descending = sortCol < 0
            const col = descending ? -sortCol - 1 : sortCol
            let rows: HTMLTableRowElement[] = Array.from(table.rows)
            rows.splice(0, 1) // remove header row
            rows = rows.sort((a, b) => {
                const ac = a.cells[col]?.textContent?.toLowerCase()
                const bc = b.cells[col]?.textContent?.toLowerCase()
                if (ac === bc) {
                    return 0
                }
                return ac < bc !== descending ? -1 : 1
            })
            for (let j = rows.length; j > 1; j--) {
                table.deleteRow(j)
            }
            for (const row of rows) {
                table.appendChild(row)
            }
        })

        return table
    }
}
