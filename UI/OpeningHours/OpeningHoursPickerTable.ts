/**
 * This is the base-table which is selectable by hovering over it.
 * It will genarate the currently selected opening hour.
 */
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import {Utils} from "../../Utils";
import {OpeningHour} from "./OpeningHours";
import {InputElement} from "../Input/InputElement";
import Translations from "../i18n/Translations";

export default class OpeningHoursPickerTable extends InputElement<OpeningHour[]> {
    public readonly IsSelected: UIEventSource<boolean>;
    private readonly weekdays: UIEventSource<UIElement[]>;

    public static readonly days: UIElement[] =
        [
            Translations.t.general.weekdays.abbreviations.monday,
            Translations.t.general.weekdays.abbreviations.tuesday,
            Translations.t.general.weekdays.abbreviations.wednesday,
            Translations.t.general.weekdays.abbreviations.thursday,
            Translations.t.general.weekdays.abbreviations.friday,
            Translations.t.general.weekdays.abbreviations.saturday,
            Translations.t.general.weekdays.abbreviations.sunday
        ]


    private readonly source: UIEventSource<OpeningHour[]>;


    constructor(weekdays: UIEventSource<UIElement[]>, source?: UIEventSource<OpeningHour[]>) {
        super(weekdays);
        this.weekdays = weekdays;
        this.source = source ?? new UIEventSource<OpeningHour[]>([]);
        this.IsSelected = new UIEventSource<boolean>(false);
        this.SetStyle("width:100%;height:100%;display:block;");

    }

    InnerRender(): string {
        let rows = "";
        const self = this;
        for (let h = 0; h < 24; h++) {
            let hs = "" + h;
            if (hs.length == 1) {
                hs = "0" + hs;
            }


            rows += `<tr><td rowspan="2" class="oh-left-col oh-timecell-full">${hs}:00</td>` +
                Utils.Times(weekday => `<td id="${this.id}-timecell-${weekday}-${h}" class="oh-timecell oh-timecell-full oh-timecell-${weekday}"></td>`, 7) +
                '</tr><tr>' +
                Utils.Times(id => `<td id="${this.id}-timecell-${id}-${h}-30" class="oh-timecell oh-timecell-half oh-timecell-${id}"></td>`, 7) +
                '</tr>';
        }
        let days = OpeningHoursPickerTable.days.map((day, i) => {
            const innerContent  =  self.weekdays.data[i]?.Render() ?? "";
            return day.Render() + "<span style='width:100%; display:block; position: relative;'>"+innerContent+"</span>";
        }).join("</th><th width='14%'>");
        return `<table id="oh-table-${this.id}" class="oh-table"><tr><th></th><th width='14%'>${days}</th></tr>${rows}</table>`;
    }

    protected InnerUpdate() {
        const self = this;
        const table = (document.getElementById(`oh-table-${this.id}`) as HTMLTableElement);
        if (table === undefined || table === null) {
            return;
        }

        for (const uielement of this.weekdays.data) {
            uielement.Update();
        }

        let mouseIsDown = false;
        let selectionStart: [number, number] = undefined;
        let selectionEnd: [number, number] = undefined;

        function h(timeSegment: number) {
            return Math.floor(timeSegment / 2);
        }

        function m(timeSegment: number) {
            return (timeSegment % 2) * 30;
        }

        function startSelection(i: number, j: number) {
            mouseIsDown = true;
            selectionStart = [i, j];
            selectionEnd = [i, j];
        }

        function endSelection() {
            if (selectionStart === undefined) {
                return;
            }
            if (!mouseIsDown) {
                return;
            }
            mouseIsDown = false
            const dStart = Math.min(selectionStart[1], selectionEnd[1]);
            const dEnd = Math.max(selectionStart[1], selectionEnd[1]);
            const timeStart = Math.min(selectionStart[0], selectionEnd[0]) - 1;
            const timeEnd = Math.max(selectionStart[0], selectionEnd[0]) - 1;
            for (let weekday = dStart; weekday <= dEnd; weekday++) {
                const oh: OpeningHour = {
                    weekday: weekday,
                    startHour: h(timeStart),
                    startMinutes: m(timeStart),
                    endHour: h(timeEnd + 1),
                    endMinutes: m(timeEnd + 1)
                }
                if (oh.endHour > 23) {
                    oh.endHour = 24;
                    oh.endMinutes = 0;
                }
                self.source.data.push(oh);
            }
            self.source.ping();

            // Clear the highlighting
            let header = table.rows[0];
            for (let j = 1; j < header.cells.length; j++) {
                header.cells[j].classList?.remove("oh-timecol-selected")
            }
            for (let i = 1; i < table.rows.length; i++) {
                let row = table.rows[i]
                for (let j = 0; j < row.cells.length; j++) {
                    let cell = row.cells[j]
                    cell?.classList?.remove("oh-timecell-selected");
                    row.classList?.remove("oh-timerow-selected");
                }
            }
        }

        table.onmouseup = () => {
            endSelection();
        };
        table.onmouseleave = () => {
            endSelection();
        };

        let lastSelectionIend, lastSelectionJEnd;
        function selectAllBetween(iEnd, jEnd) {

            if (lastSelectionIend === iEnd && lastSelectionJEnd === jEnd) {
                return; // We already did this
            }
            lastSelectionIend = iEnd;
            lastSelectionJEnd = jEnd;

            let iStart = selectionStart[0];
            let jStart = selectionStart[1];

            if (iStart > iEnd) {
                const h = iStart;
                iStart = iEnd;
                iEnd = h;
            }
            if (jStart > jEnd) {
                const h = jStart;
                jStart = jEnd;
                jEnd = h;
            }

            let header = table.rows[0];
            for (let j = 1; j < header.cells.length; j++) {
                let cell = header.cells[j]
                cell.classList?.remove("oh-timecol-selected-round-left");
                cell.classList?.remove("oh-timecol-selected-round-right");

                if (jStart + 1 <= j && j <= jEnd + 1) {
                    cell.classList?.add("oh-timecol-selected")
                    if (jStart + 1 == j) {
                        cell.classList?.add("oh-timecol-selected-round-left");
                    }
                    if (jEnd + 1 == j) {
                        cell.classList?.add("oh-timecol-selected-round-right");
                    }

                } else {
                    cell.classList?.remove("oh-timecol-selected")
                }
            }


            for (let i = 1; i < table.rows.length; i++) {
                let row = table.rows[i];
                if (iStart <= i && i <= iEnd) {
                    row.classList?.add("oh-timerow-selected")
                } else {
                    row.classList?.remove("oh-timerow-selected")
                }
                for (let j = 0; j < row.cells.length; j++) {
                    let cell = row.cells[j]
                    if (cell === undefined) {
                        continue;
                    }
                    let offset = 0;
                    if (i % 2 == 1) {
                        if (j == 0) {
                            // This is the first column of a full hour -> This is the time indication (skip)
                            continue;
                        }
                        offset = -1;
                    }


                    if (iStart <= i && i <= iEnd &&
                        jStart <= j + offset && j + offset <= jEnd) {
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
                let offset = 0;
                if (i % 2 == 1) {
                    if (j == 0) {
                        continue;
                    }
                    offset = -1;
                }


                cell.onmousedown = (ev) => {
                    ev.preventDefault();
                    startSelection(i, j + offset)
                    selectAllBetween(i, j + offset);
                }
                cell.ontouchstart = (ev) => {
                    ev.preventDefault();
                    startSelection(i, j + offset);
                    selectAllBetween(i, j + offset);
                }
                cell.onmouseenter = () => {
                    if (mouseIsDown) {
                        selectionEnd = [i, j + offset];
                        selectAllBetween(i, j + offset)
                    }
                }


                cell.ontouchmove = (ev: TouchEvent) => {

                    ev.preventDefault();
                    for (const k in ev.targetTouches) {
                        const touch = ev.targetTouches[k];
                        if(touch.clientX === undefined || touch.clientY === undefined){
                            continue;
                        }
                        const elUnderTouch = document.elementFromPoint(
                            touch.clientX,
                            touch.clientY
                        );
                        // @ts-ignore
                        const f = elUnderTouch.onmouseenter;
                        if (f) {
                            f();
                        }
                    }

                }

                cell.ontouchend = (ev) => {
                    ev.preventDefault();
                    endSelection();
                }
            }

        }


    }

    IsValid(t: OpeningHour[]): boolean {
        return true;
    }

    GetValue(): UIEventSource<OpeningHour[]> {
        return this.source;
    }

}