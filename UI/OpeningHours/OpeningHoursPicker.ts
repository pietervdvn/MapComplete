import { UIEventSource } from "../../Logic/UIEventSource"
import OpeningHoursPickerTable from "./OpeningHoursPickerTable"
import { OH, OpeningHour } from "./OpeningHours"
import { InputElement } from "../Input/InputElement"
import BaseUIElement from "../BaseUIElement"

export default class OpeningHoursPicker extends InputElement<OpeningHour[]> {
    public readonly IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false)
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

    InnerRender(): BaseUIElement {
        return this._backgroundTable
    }

    GetValue(): UIEventSource<OpeningHour[]> {
        return this._ohs
    }

    IsValid(t: OpeningHour[]): boolean {
        return true
    }

    /**
     *
     * const rules = OH.ParseRule("Jul-Aug Sa closed; Mo,Tu,Th,Fr,PH 12:00-22:30, We 17:00-22:30, Sa 14:00-19:00, Su 10:00-21:00; Dec 24,25,31 off; Jan 1 off")
     * const v = new UIEventSource(rules)
     * const ohpicker = new OpeningHoursPicker(v)
     * const html = ohpicker.InnerConstructElement()
     * html !== undefined // => true
     */
    protected InnerConstructElement(): HTMLElement {
        return this._backgroundTable.ConstructElement()
    }
}
