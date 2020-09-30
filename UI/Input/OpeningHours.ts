import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {Utils} from "../../Utils";

export interface OpeningHour {
    weekdayStart: number, // 0 is monday, 1 is tuesday, ...
    weekdayEnd: number,
    startHour: number,
    startMinutes: number,
    endHour: number,
    endMinutes: number
}

export default class OpeningHours extends InputElement<OpeningHour[]> {
    public readonly IsSelected: UIEventSource<boolean>;

    public static readonly days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    private readonly source: UIEventSource<OpeningHour[]>;

    constructor(source: UIEventSource<OpeningHour[]> = undefined) {
        super();
        this.source = source ?? new UIEventSource<OpeningHour[]>([]);
        this.IsSelected = new UIEventSource<boolean>(false);
    }

    InnerRender(): string {
        let rows = "";
        for (let h = 0; h < 24; h++) {
            let hs = "" + h;
            if (hs.length == 1) {
                hs = "0" + hs;
            }
            for (let m = 0; m < 60; m += 60) {
                let min = "" + m;
                const style = "width:0.5em;font-size:small;";
                if (m === 0) {
                    min = "00";
                }
                rows += `<tr><td class="oh-left-col" rowspan="4" style="${style}">${hs}:${min}</td>` +
                    Utils.Times('<td class="oh-timecell oh-timecell-full"></td>', 7) +
                    '</tr><tr>' +
                    Utils.Times('<td class="oh-timecell"></td>', 7) +
                    '</tr><tr>' +
                    Utils.Times('<td class="oh-timecell oh-timecell-half"></td>', 7) +
                    '</tr><tr>' +
                    Utils.Times('<td class="oh-timecell"></td>', 7) +
                    '</tr>';
            }
        }
        let days = OpeningHours.days.join("</th><th>");
        return `<table id="oh-table-${this.id}" class="oh-table"><tr><th></th><th>${days}</tr>${rows}</table>`;
    }

    protected InnerUpdate() {
        const self = this;
        const table = (document.getElementById(`oh-table-${this.id}`) as HTMLTableElement);
        if (table === undefined || table === null) {
            return;
        }

        let mouseIsDown = false;
        let selectionStart: [number, number] = undefined;
        let selectionEnd: [number, number] = undefined;

        function h(timeSegment: number) {
            return Math.floor(timeSegment / 4);
        }

        function m(timeSegment: number) {
            return (timeSegment % 4) * 15;
        }

        function hhmm(timeSegment: number) {
            return h(timeSegment) + ":" + m(timeSegment)
        }


        function startSelection(i: number, j: number, cell: HTMLElement) {
            mouseIsDown = true;
            selectionStart = [i, j];
            selectionEnd = [i, j];
            cell.classList.add("oh-timecell-selected")
        }

        function endSelection() {
            if (selectionStart === undefined) {
                return;
            }
            mouseIsDown = false
            const dStart = Math.min(selectionStart[1], selectionEnd[1]);
            const dEnd = Math.max(selectionStart[1], selectionEnd[1]);
            const timeStart = Math.min(selectionStart[0], selectionEnd[0]) - 1;
            const timeEnd = Math.max(selectionStart[0], selectionEnd[0]) - 1;
            console.log("Selected from day", OpeningHours.days[dStart], "at",
                hhmm(timeStart), "till", OpeningHours.days[dEnd], "at", hhmm(timeEnd + 1)
            )
            const oh: OpeningHour = {
                weekdayStart: dStart,
                weekdayEnd: dEnd,
                startHour: h(timeStart),
                startMinutes: m(timeStart),
                endHour: h(timeEnd + 1),
                endMinutes: m(timeEnd + 1)
            }
            self.source.data.push(oh);
            self.source.ping();
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
                    let offset = 0;
                    if (i % 4 == 1) {
                        if (j == 0) {
                            continue;
                        }
                        offset = -1;
                    }
                    if (iStart <= i && i <= iEnd &&
                        jStart <= j + offset && j + offset <= jEnd) {
                        cell.classList.add("oh-timecell-selected")
                    } else {
                        cell.classList.remove("oh-timecell-selected")
                    }

                }

            }
        }

        for (let i = 1; i < table.rows.length; i++) {
            let row = table.rows[i]
            for (let j = 0; j < row.cells.length; j++) {
                let cell = row.cells[j]
                let offset = 0;
                if (i % 4 == 1) {
                    if (j == 0) {
                        continue;
                    }
                    offset = -1;
                }


                cell.onmousedown = (ev) => {
                    ev.preventDefault();
                    startSelection(i, j + offset, cell)
                }
                cell.ontouchstart = (ev) => {
                    ev.preventDefault();
                    startSelection(i, j + offset, cell)
                }
                cell.onmouseenter = () => {
                    if (mouseIsDown) {
                        selectionEnd = [i, j + offset];
                        selectAllBetween(i, j + offset)
                    }
                }

                cell.ontouchmove = (ev) => {
                    ev.preventDefault();
                    selectionEnd = [i, j + offset];
                    selectAllBetween(i, j + offset)
                }

                cell.ontouchend = (ev) => {
                    ev.preventDefault();
                    selectionEnd = [i, j + offset];
                    selectAllBetween(i, j + offset)
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