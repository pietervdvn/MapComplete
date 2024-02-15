/**
 * This is the base-table which is selectable by hovering over it.
 * It will genarate the currently selected opening hour.
 */
import { UIEventSource } from "../../Logic/UIEventSource"
import { Utils } from "../../Utils"
import { OpeningHour } from "./OpeningHours"
import { InputElement } from "../Input/InputElement"
import Translations from "../i18n/Translations"
import { Translation } from "../i18n/Translation"
import { FixedUiElement } from "../Base/FixedUiElement"
import { VariableUiElement } from "../Base/VariableUIElement"
import Combine from "../Base/Combine"
import OpeningHoursRange from "./OpeningHoursRange"

export default class OpeningHoursPickerTable extends InputElement<OpeningHour[]> {
    public static readonly days: Translation[] = [
        Translations.t.general.weekdays.abbreviations.monday,
        Translations.t.general.weekdays.abbreviations.tuesday,
        Translations.t.general.weekdays.abbreviations.wednesday,
        Translations.t.general.weekdays.abbreviations.thursday,
        Translations.t.general.weekdays.abbreviations.friday,
        Translations.t.general.weekdays.abbreviations.saturday,
        Translations.t.general.weekdays.abbreviations.sunday,
    ]
    /*
    These html-elements are an overlay over the table columns and act as a host for the ranges in the weekdays
     */
    public readonly weekdayElements: HTMLElement[] = Utils.TimesT(7, () =>
        document.createElement("div")
    )
    private readonly source: UIEventSource<OpeningHour[]>

    constructor(source?: UIEventSource<OpeningHour[]>) {
        super()
        this.source = source ?? new UIEventSource<OpeningHour[]>([])
        this.SetClass("w-full block")
    }

    IsValid(_: OpeningHour[]): boolean {
        return true
    }

    GetValue(): UIEventSource<OpeningHour[]> {
        return this.source
    }

    protected InnerConstructElement(): HTMLElement {
        const table = document.createElement("table")
        table.classList.add("oh-table")
        table.classList.add("no-weblate")
        table.classList.add("relative") // Workaround for webkit-based viewers, see #1019

        const cellHeightInPx = 14

        const headerRow = document.createElement("tr")
        headerRow.appendChild(document.createElement("th"))
        headerRow.classList.add("relative")
        for (let i = 0; i < OpeningHoursPickerTable.days.length; i++) {
            let weekday = OpeningHoursPickerTable.days[i].Clone()
            const cell = document.createElement("th")
            cell.style.width = "14%"
            cell.appendChild(weekday.ConstructElement())

            const fullColumnSpan = this.weekdayElements[i]
            fullColumnSpan.classList.add("w-full", "relative")

            // We need to round! The table height is rounded as following, we use this to calculate the actual number of pixels afterwards
            fullColumnSpan.style.height = cellHeightInPx * 48 + "px"

            const ranges = new VariableUiElement(
                this.source
                    .map((ohs) => (ohs ?? []).filter((oh: OpeningHour) => oh.weekday === i))
                    .map((ohsForToday) => {
                        return new Combine(
                            ohsForToday.map(
                                (oh) =>
                                    new OpeningHoursRange(oh, () => {
                                        this.source.data.splice(this.source.data.indexOf(oh), 1)
                                        this.source.ping()
                                    })
                            )
                        )
                    })
            )
            fullColumnSpan.appendChild(ranges.ConstructElement())

            const fullColumnSpanWrapper = document.createElement("div")
            fullColumnSpanWrapper.classList.add("absolute")
            fullColumnSpanWrapper.style.zIndex = "10"
            fullColumnSpanWrapper.style.width = "13.5%"
            fullColumnSpanWrapper.style.pointerEvents = "none"

            fullColumnSpanWrapper.appendChild(fullColumnSpan)

            cell.appendChild(fullColumnSpanWrapper)
            headerRow.appendChild(cell)
        }

        table.appendChild(headerRow)

        const self = this
        for (let h = 0; h < 24; h++) {
            const hs = Utils.TwoDigits(h)
            const firstCell = document.createElement("td")
            firstCell.rowSpan = 2
            firstCell.classList.add("oh-left-col", "oh-timecell-full", "border-box")
            firstCell.appendChild(new FixedUiElement(hs + ":00").ConstructElement())

            const evenRow = document.createElement("tr")
            evenRow.appendChild(firstCell)

            for (let weekday = 0; weekday < 7; weekday++) {
                const cell = document.createElement("td")
                cell.classList.add("oh-timecell", "oh-timecell-full", `oh-timecell-${weekday}`)
                evenRow.appendChild(cell)
            }
            evenRow.style.height = cellHeightInPx + "px"
            evenRow.style.maxHeight = evenRow.style.height
            evenRow.style.minHeight = evenRow.style.height
            table.appendChild(evenRow)

            const oddRow = document.createElement("tr")

            for (let weekday = 0; weekday < 7; weekday++) {
                const cell = document.createElement("td")
                cell.classList.add("oh-timecell", "oh-timecell-half", `oh-timecell-${weekday}`)
                oddRow.appendChild(cell)
            }
            oddRow.style.minHeight = evenRow.style.height
            oddRow.style.maxHeight = evenRow.style.height

            table.appendChild(oddRow)
        }

        /**** Event handling below ***/

        let mouseIsDown = false
        let selectionStart: [number, number] = undefined
        let selectionEnd: [number, number] = undefined

        function h(timeSegment: number) {
            return Math.floor(timeSegment / 2)
        }

        function m(timeSegment: number) {
            return (timeSegment % 2) * 30
        }

        function startSelection(i: number, j: number) {
            mouseIsDown = true
            selectionStart = [i, j]
            selectionEnd = [i, j]
        }

        function endSelection() {
            if (selectionStart === undefined) {
                return
            }
            if (!mouseIsDown) {
                return
            }
            mouseIsDown = false
            const dStart = Math.min(selectionStart[1], selectionEnd[1])
            const dEnd = Math.max(selectionStart[1], selectionEnd[1])
            const timeStart = Math.min(selectionStart[0], selectionEnd[0]) - 1
            const timeEnd = Math.max(selectionStart[0], selectionEnd[0]) - 1
            for (let weekday = dStart; weekday <= dEnd; weekday++) {
                const oh: OpeningHour = {
                    weekday: weekday,
                    startHour: h(timeStart),
                    startMinutes: m(timeStart),
                    endHour: h(timeEnd + 1),
                    endMinutes: m(timeEnd + 1),
                }
                if (oh.endHour > 23) {
                    oh.endHour = 24
                    oh.endMinutes = 0
                }
                self.source.data.push(oh)
            }
            self.source.ping()

            // Clear the highlighting
            let header = table.rows[0]
            for (let j = 1; j < header.cells.length; j++) {
                header.cells[j].classList?.remove("oh-timecol-selected")
            }
            for (let i = 1; i < table.rows.length; i++) {
                let row = table.rows[i]
                for (let j = 0; j < row.cells.length; j++) {
                    let cell = row.cells[j]
                    cell?.classList?.remove("oh-timecell-selected")
                    row.classList?.remove("oh-timerow-selected")
                }
            }
        }

        table.onmouseup = () => {
            endSelection()
        }
        table.onmouseleave = () => {
            endSelection()
        }

        let lastSelectionIend, lastSelectionJEnd

        function selectAllBetween(iEnd, jEnd) {
            if (lastSelectionIend === iEnd && lastSelectionJEnd === jEnd) {
                return // We already did this
            }
            lastSelectionIend = iEnd
            lastSelectionJEnd = jEnd

            let iStart = selectionStart[0]
            let jStart = selectionStart[1]

            if (iStart > iEnd) {
                const h = iStart
                iStart = iEnd
                iEnd = h
            }
            if (jStart > jEnd) {
                const h = jStart
                jStart = jEnd
                jEnd = h
            }

            let header = table.rows[0]
            for (let j = 1; j < header.cells.length; j++) {
                let cell = header.cells[j]
                cell.classList?.remove("oh-timecol-selected-round-left")
                cell.classList?.remove("oh-timecol-selected-round-right")

                if (jStart + 1 <= j && j <= jEnd + 1) {
                    cell.classList?.add("oh-timecol-selected")
                    if (jStart + 1 == j) {
                        cell.classList?.add("oh-timecol-selected-round-left")
                    }
                    if (jEnd + 1 == j) {
                        cell.classList?.add("oh-timecol-selected-round-right")
                    }
                } else {
                    cell.classList?.remove("oh-timecol-selected")
                }
            }

            for (let i = 1; i < table.rows.length; i++) {
                let row = table.rows[i]
                if (iStart <= i && i <= iEnd) {
                    row.classList?.add("oh-timerow-selected")
                } else {
                    row.classList?.remove("oh-timerow-selected")
                }
                for (let j = 0; j < row.cells.length; j++) {
                    let cell = row.cells[j]
                    if (cell === undefined) {
                        continue
                    }
                    let offset = 0
                    if (i % 2 == 1) {
                        if (j == 0) {
                            // This is the first column of a full hour -> This is the time indication (skip)
                            continue
                        }
                        offset = -1
                    }

                    if (iStart <= i && i <= iEnd && jStart <= j + offset && j + offset <= jEnd) {
                        cell?.classList?.add("oh-timecell-selected")
                    } else {
                        cell?.classList?.remove("oh-timecell-selected")
                    }
                }
            }
        }

        for (let i = 1; i < table.rows.length; i++) {
            let row = table.rows[i]
            for (let j = 0; j < row.cells.length; j++) {
                let cell = row.cells[j]
                let offset = 0
                if (i % 2 == 1) {
                    if (j == 0) {
                        continue
                    }
                    offset = -1
                }

                cell.onmousedown = (ev) => {
                    ev.preventDefault()
                    startSelection(i, j + offset)
                    selectAllBetween(i, j + offset)
                }
                cell.ontouchstart = (ev) => {
                    ev.preventDefault()
                    startSelection(i, j + offset)
                    selectAllBetween(i, j + offset)
                }
                cell.onmouseenter = () => {
                    if (mouseIsDown) {
                        selectionEnd = [i, j + offset]
                        selectAllBetween(i, j + offset)
                    }
                }

                cell.ontouchmove = (ev: TouchEvent) => {
                    ev.preventDefault()
                    for (const k in ev.targetTouches) {
                        const touch = ev.targetTouches[k]
                        if (touch.clientX === undefined || touch.clientY === undefined) {
                            continue
                        }
                        const elUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY)
                        // @ts-ignore
                        const f = elUnderTouch.onmouseenter
                        if (f) {
                            f()
                        }
                    }
                }

                cell.ontouchend = (ev) => {
                    ev.preventDefault()
                    endSelection()
                }
            }
        }

        return table
    }
}
