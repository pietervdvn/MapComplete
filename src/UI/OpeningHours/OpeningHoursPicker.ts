import { UIEventSource } from "../../Logic/UIEventSource"
import OpeningHoursPickerTable from "./OpeningHoursPickerTable"
import { OH, OpeningHour } from "./OpeningHours"
import { InputElement } from "../Input/InputElement"

export default class OpeningHoursPicker extends InputElement<OpeningHour[]> {
    private readonly _ohs: UIEventSource<OpeningHour[]>
    private readonly _backgroundTable: OpeningHoursPickerTable

    constructor(ohs: UIEventSource<OpeningHour[]> = new UIEventSource<OpeningHour[]>([])) {
        super()
        this._ohs = ohs

        ohs.addCallback((oh) => {
            ohs.setData(OH.MergeTimes(oh))
        })

        this._backgroundTable = new OpeningHoursPickerTable(this._ohs)
        this._backgroundTable.ConstructElement()
    }

    GetValue(): UIEventSource<OpeningHour[]> {
        return this._ohs
    }

    IsValid(_: OpeningHour[]): boolean {
        return true
    }

    protected InnerConstructElement(): HTMLElement {
        return this._backgroundTable.ConstructElement()
    }
}
