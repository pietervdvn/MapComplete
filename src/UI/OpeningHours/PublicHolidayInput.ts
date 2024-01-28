import { OH } from "./OpeningHours"
import { UIEventSource } from "../../Logic/UIEventSource"
import Combine from "../Base/Combine"
import { TextField } from "../Input/TextField"
import { DropDown } from "../Input/DropDown"
import { InputElement } from "../Input/InputElement"
import Translations from "../i18n/Translations"
import Toggle from "../Input/Toggle"

export default class PublicHolidayInput extends InputElement<string> {
    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false)

    private readonly _value: UIEventSource<string>

    constructor(value: UIEventSource<string> = new UIEventSource<string>("")) {
        super()
        this._value = value
    }

    GetValue(): UIEventSource<string> {
        return this._value
    }

    IsValid(_: string): boolean {
        return true
    }

    protected InnerConstructElement(): HTMLElement {
        const dropdown = new DropDown(Translations.t.general.opening_hours.open_during_ph.Clone(), [
            { shown: Translations.t.general.opening_hours.ph_not_known.Clone(), value: "" },
            { shown: Translations.t.general.opening_hours.ph_closed.Clone(), value: "off" },
            { shown: Translations.t.general.opening_hours.ph_open_as_usual.Clone(), value: "open" },
            { shown: Translations.t.general.opening_hours.ph_open.Clone(), value: " " },
        ]).SetClass("inline-block w-full")
        /*
         * Either "" (unknown), " " (opened) or "off" (closed)
         * */
        const mode = dropdown.GetValue()

        const start = new TextField({
            placeholder: "starthour",
            htmlType: "time",
        }).SetClass("inline-block")
        const end = new TextField({
            placeholder: "starthour",
            htmlType: "time",
        }).SetClass("inline-block")

        const askHours = new Toggle(
            new Combine([
                Translations.t.general.opening_hours.opensAt.Clone(),
                start,
                Translations.t.general.opening_hours.openTill.Clone(),
                end,
            ]),
            undefined,
            mode.map((mode) => mode === " ")
        )

        this.SetupDataSync(mode, start.GetValue(), end.GetValue())

        return new Combine([dropdown, askHours]).SetClass("w-full flex").ConstructElement()
    }

    private SetupDataSync(
        mode: UIEventSource<string>,
        startTime: UIEventSource<string>,
        endTime: UIEventSource<string>
    ) {
        const value = this._value
        value
            .map((ph) => OH.ParsePHRule(ph))
            .addCallbackAndRunD((parsed) => {
                if (parsed === null) {
                    return
                }
                mode.setData(parsed.mode)
                startTime.setData(parsed.start)
                endTime.setData(parsed.end)
            })

        // We use this as a 'addCallbackAndRun'
        mode.map(
            (mode) => {
                if (mode === undefined || mode === "") {
                    // not known
                    value.setData(undefined)
                    return
                }
                if (mode === "off") {
                    value.setData("PH off")
                    return
                }
                if (mode === "open") {
                    value.setData("PH open")
                    return
                }

                // Open during PH with special hours
                if (startTime.data === undefined || endTime.data === undefined) {
                    // hours not filled in - not saveable
                    value.setData(undefined)
                    return
                }
                const oh = `PH ${startTime.data}-${endTime.data}`
                value.setData(oh)
            },
            [startTime, endTime]
        )
    }
}
