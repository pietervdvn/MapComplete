import {InputElement} from "../InputElement";
import {OpeningHour} from "../../../Logic/OpeningHours";
import {UIEventSource} from "../../../Logic/UIEventSource";
import {Utils} from "../../../Utils";
import {UIElement} from "../../UIElement";
import Translations from "../../i18n/Translations";

/**
 * This is the base-table which is selectable by hovering over it.
 * It will genarate the currently selected opening hour.
 */
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
                Utils.Times(weekday => {
                    let innerContent = "";
                    if (h == 0) {
                        innerContent =  self.weekdays.data[weekday]?.Render() ?? "";
                    }
                    return `<td id="${this.id}-timecell-${weekday}-${h}" class="oh-timecell oh-timecell-full"><div class="oh-timecell-inner"></div>${innerContent}</td>`;
                }, 7) +
                '</tr><tr>' +
                Utils.Times(id => `<td id="${this.id}-timecell-${id}-${h}-30" class="oh-timecell oh-timecell-half"><div class="oh-timecell-inner"></div></td>`, 7) +
                '</tr>';
        }
        let days = OpeningHoursPickerTable.days.map(day => day.Render()).join("</th><th width='14%'>");
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
                if(oh.endHour > 23){
                    oh.endHour = 24;
                    oh.endMinutes = 0;
                }
                self.source.data.push(oh);
            }
            self.source.ping();

            // Clear the highlighting
            for (let i = 1; i < table.rows.length; i++) {
                let row = table.rows[i]
                for (let j = 0; j < row.cells.length; j++) {
                    let cell = row.cells[j]
                    cell?.classList?.remove("oh-timecell-selected")
                }
            }
        }

        table.onmouseup = () => {
            endSelection();
        };
        table.onmouseleave = () => {
            endSelection();
        };

        function selectAllBetween(iEnd, jEnd) {
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

            for (let i = 1; i < table.rows.length; i++) {
                let row = table.rows[i]
                for (let j = 0; j < row.cells.length; j++) {
                    let cell = row.cells[j]
                    if (cell === undefined) {
                        continue;
                    }
                    let offset = 0;
                    if (i % 2 == 1) {
                        if (j == 0) {
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
                let cell = row.cells[j].getElementsByClassName("oh-timecell-inner")[0] as HTMLElement
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