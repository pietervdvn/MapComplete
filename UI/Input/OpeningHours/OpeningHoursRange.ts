import {UIElement} from "../../UIElement";
import {UIEventSource} from "../../../Logic/UIEventSource";
import {OpeningHour} from "../../../Logic/OpeningHours";
import {TextField} from "../TextField";
import Combine from "../../Base/Combine";
import {Utils} from "../../../Utils";
import {FixedUiElement} from "../../Base/FixedUiElement";

/**
 * A single opening hours range, shown on top of the OH-picker table
 */
export default class OpeningHoursRange extends UIElement {
    private _oh: UIEventSource<OpeningHour>;

    private _startTime: TextField;
    private _endTime: TextField;
    private _deleteRange: UIElement;

    constructor(oh: UIEventSource<OpeningHour>) {
        super(oh);
        const self = this;
        this._oh = oh;
        this.SetClass("oh-timerange");
        oh.addCallbackAndRun(oh => {
            const el = document.getElementById(this.id) as HTMLElement;
            self.InnerUpdate(el);
        })

        this._deleteRange = new FixedUiElement("<img src='./assets/delete.svg'>")
            .SetClass("oh-delete-range")
            .onClick(() => {
                oh.data.weekday = undefined;
                oh.ping();
            });

        this._startTime = new TextField({
            value: oh.map(oh => {
                if (oh) {
                    return Utils.TwoDigits(oh.startHour) + ":" + Utils.TwoDigits(oh.startMinutes);
                }
            }),
            htmlType: "time"
        });

        this._endTime = new TextField({
            value: oh.map(oh => {
                if (oh) {
                    if (oh.endHour == 24) {
                        return "00:00";
                    }
                    return Utils.TwoDigits(oh.endHour) + ":" + Utils.TwoDigits(oh.endMinutes);
                }
            }),
            htmlType: "time"
        });


        function applyStartTime() {
            if (self._startTime.GetValue().data === undefined) {
                return;
            }
            const spl = self._startTime.GetValue().data.split(":");
            oh.data.startHour = Number(spl[0]);
            oh.data.startMinutes = Number(spl[1]);

            if (oh.data.startHour >= oh.data.endHour) {
                if (oh.data.startMinutes + 10 >= oh.data.endMinutes) {
                    oh.data.endHour = oh.data.startHour + 1;
                    oh.data.endMinutes = oh.data.startMinutes;
                    if (oh.data.endHour > 23) {
                        oh.data.endHour = 24;
                        oh.data.endMinutes = 0;
                        oh.data.startHour = Math.min(oh.data.startHour, 23);
                        oh.data.startMinutes = Math.min(oh.data.startMinutes, 45);
                    }
                }
            }

            oh.ping();
        }

        function applyEndTime() {
            if (self._endTime.GetValue().data === undefined) {
                return;
            }
            const spl = self._endTime.GetValue().data.split(":");
            let newEndHour = Number(spl[0]);
            const newEndMinutes = Number(spl[1]);
            if (newEndHour == 0 && newEndMinutes == 0) {
                newEndHour = 24;
            }

            if (newEndHour == oh.data.endMinutes && newEndMinutes == oh.data.endMinutes) {
                // NOthing to change
                return;
            }

            oh.data.endHour = newEndHour;
            oh.data.endMinutes = newEndMinutes;

            oh.ping();
        }

        this._startTime.GetValue().addCallbackAndRun(startTime => {
            const spl = startTime.split(":");
            if (spl[0].startsWith('0') || spl[1].startsWith('0')) {
                return;
            }
            applyStartTime();
        });

        this._endTime.GetValue().addCallbackAndRun(endTime => {
            const spl = endTime.split(":");
            if (spl[0].startsWith('0') || spl[1].startsWith('0')) {
                return;
            }
            applyEndTime()
        });
        this._startTime.enterPressed.addCallback(() => {
            applyStartTime();
        });
        this._endTime.enterPressed.addCallbackAndRun(() => {
            applyEndTime();
        })

        this._startTime.IsSelected.addCallback(isSelected => {
            if (!isSelected) {
                applyStartTime();
            }
        });

        this._endTime.IsSelected.addCallback(isSelected => {
            if (!isSelected) {
                applyEndTime();
            }
        })

    }

    InnerRender(): string {
        const oh = this._oh.data;
        if (oh === undefined) {
            return "";
        }
        const height = this.getHeight();
        return new Combine([this._startTime, this._deleteRange, this._endTime])
            .SetClass(height < 2 ? "oh-timerange-inner-small" : "oh-timerange-inner")
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
        const height = this.getHeight();
        el.style.height = `${height * 200}%`
        const upperDiff = (oh.startHour + oh.startMinutes / 60);
        el.style.marginTop = `${2 * upperDiff * el.parentElement.offsetHeight - upperDiff*0.75}px`;
    }


}