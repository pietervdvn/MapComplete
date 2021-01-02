/**
 * A single opening hours range, shown on top of the OH-picker table
 */
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import Svg from "../../Svg";
import {Utils} from "../../Utils";
import Combine from "../Base/Combine";
import {OH, OpeningHour} from "./OpeningHours";

export default class OpeningHoursRange extends UIElement {
    private _oh: UIEventSource<OpeningHour>;

    private readonly _startTime: UIElement;
    private readonly _endTime: UIElement;
    private readonly _deleteRange: UIElement;
    private readonly _tableId: string;

    constructor(oh: UIEventSource<OpeningHour>, tableId: string) {
        super(oh);
        this._tableId = tableId;
        const self = this;
        this._oh = oh;
        this.SetClass("oh-timerange");
        oh.addCallbackAndRun(() => {
            const el = document.getElementById(this.id) as HTMLElement;
            self.InnerUpdate(el);
        })

        this._deleteRange = 
            Svg.delete_icon_ui()
            .SetClass("oh-delete-range")
            .onClick(() => {
                oh.data.weekday = undefined;
                oh.ping();
            });


        this._startTime = new VariableUiElement(oh.map(oh => {
            return Utils.TwoDigits(oh.startHour) + ":" + Utils.TwoDigits(oh.startMinutes);
        })).SetClass("oh-timerange-label")

        this._endTime = new VariableUiElement(oh.map(oh => {
            return Utils.TwoDigits(oh.endHour) + ":" + Utils.TwoDigits(oh.endMinutes);
        })).SetClass("oh-timerange-label")


    }

    InnerRender(): string {
        const oh = this._oh.data;
        if (oh === undefined) {
            return "";
        }
        const height = this.getHeight();

        let content = [this._deleteRange]
        if (height > 2) {
            content = [this._startTime, this._deleteRange, this._endTime];
        }

        return new Combine(content)
            .SetClass("oh-timerange-inner")
            .Render();
    }

    private getHeight(): number {
        const oh = this._oh.data;

        let endhour = oh.endHour;
        if (oh.endHour == 0 && oh.endMinutes == 0) {
            endhour = 24;
        }
        const height = (endhour - oh.startHour + ((oh.endMinutes - oh.startMinutes) / 60));
        return height;
    }

    protected InnerUpdate(el: HTMLElement) {
        if (el == null) {
            return;
        }
        const oh = this._oh.data;
        if (oh === undefined) {
            return;
        }

        // The header cell containing monday, tuesday, ...
        const table = document.getElementById(this._tableId) as HTMLTableElement;

        const bodyRect = document.body.getBoundingClientRect();
        const rangeStart = table.rows[1].cells[1].getBoundingClientRect().top - bodyRect.top;
        const rangeEnd = table.rows[table.rows.length - 1].cells[1].getBoundingClientRect().bottom - bodyRect.top;

        const pixelsPerHour = (rangeEnd - rangeStart) / 24;

        el.style.top = (pixelsPerHour * OH.startTime(oh)) + "px";
        el.style.height = (pixelsPerHour * (OH.endTime(oh) - OH.startTime(oh))) + "px";

    }


}