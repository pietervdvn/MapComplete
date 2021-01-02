
import {OH} from "./OpeningHours";
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import Combine from "../Base/Combine";
import {TextField} from "../Input/TextField";
import {DropDown} from "../Input/DropDown";
import {InputElement} from "../Input/InputElement";
import Translations from "../i18n/Translations";

export default class PublicHolidayInput extends InputElement<string> {
    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    private readonly _value: UIEventSource<string>;
    private readonly _dropdown: UIElement;
    private readonly _mode: UIEventSource<string>;
    private readonly _startHour: UIElement;
    private readonly _endHour: UIElement;

    constructor(value: UIEventSource<string> = new UIEventSource<string>("")) {
        super();
        this._value = value;

        const dropdown = new DropDown(
            Translations.t.general.opening_hours.open_during_ph,
            [
                {shown: Translations.t.general.opening_hours.ph_not_known, value: ""},
                {shown: Translations.t.general.opening_hours.ph_closed, value: "off"},
                {shown:Translations.t.general.opening_hours.ph_open, value: " "}
            ]
        );
        this._dropdown = dropdown.SetStyle("display:inline-block;");
        this._mode = dropdown.GetValue();
        this.ListenTo(this._mode);

        const start = new TextField({
            placeholder: "starthour",
            htmlType: "time"
        });
        const end = new TextField({
            placeholder: "starthour",
            htmlType: "time"
        });
        this._startHour = start.SetStyle("display:inline-block;");
        this._endHour = end.SetStyle("display:inline-block;");
        const self = this;

        this._value.addCallbackAndRun(ph => {
            if (ph === undefined) {
                return;
            }
            const parsed = PublicHolidayInput.LoadValue(ph);
            if (parsed === null) {
                return;
            }

            dropdown.GetValue().setData(parsed.mode);
            if (parsed.start) {
                start.GetValue().setData(parsed.start);
            }
            if (parsed.end) {
                end.GetValue().setData(parsed.end);
            }

        })


        function updateValue() {
            const phStart = dropdown.GetValue().data;
            if (phStart === undefined || phStart === "") {
                // Unknown
                self._value.setData("");
                return;
            }

            if (phStart === " ") {
                // THey are open, we need to include the start- and enddate
                const startV = start.GetValue().data;
                const endV = end.GetValue().data;
                if (startV === undefined || endV === undefined) {
                    self._value.setData(`PH open`);
                    return;
                }

                self._value.setData(`PH ${startV}-${endV}`);
                return;
            }
            self._value.setData(`PH ${phStart}`);
        }

        dropdown.GetValue().addCallbackAndRun(() => {
            updateValue();
        });
        start.GetValue().addCallbackAndRun(() => {
            updateValue();
        });
        end.GetValue().addCallbackAndRun(() => {
            updateValue();
        });
    }

    public static LoadValue(str: string): {
        mode: string,
        start?: string,
        end?: string
    } {
        str = str.trim();
        if (!str.startsWith("PH")) {
            return null;
        }

        str = str.trim();
        if (str === "PH off") {
            return {
                mode: "off"
            }
        }
        
        if(str === "PH open"){
            return {
                mode: " "
            }
        }

        if (!str.startsWith("PH ")) {
            return null;
        }
        try {

            const timerange = OH.parseHHMMRange(str.substring(2));
            if (timerange === null) {
                return null;
            }

            return {
                mode: " ",
                start: OH.hhmm(timerange.startHour, timerange.startMinutes),
                end: OH.hhmm(timerange.endHour, timerange.endMinutes),

            }
        } catch (e) {
            return null;
        }
    }

    InnerRender(): string {
        const mode = this._mode.data;
        if (mode === " ") {
            return new Combine([this._dropdown,
                " ",
                Translations.t.general.opening_hours.opensAt,
                " ",
                this._startHour,
                " ",
                Translations.t.general.opening_hours.openTill,
                " ",
                this._endHour]).Render();
        }
        return this._dropdown.Render();
    }

    GetValue(): UIEventSource<string> {
        return this._value;
    }

    IsValid(t: string): boolean {
        return true;
    }

}