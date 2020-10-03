import {UIElement} from "../../UIElement";
import {InputElement} from "../InputElement";
import {OpeningHour, OpeningHourUtils} from "../../../Logic/OpeningHours";
import {UIEventSource} from "../../../Logic/UIEventSource";
import OpeningHoursPickerTable from "./OpeningHoursPickerTable";
import OpeningHoursRange from "./OpeningHoursRange";
import Combine from "../../Base/Combine";

export default class OpeningHoursPicker extends InputElement<OpeningHour[]> {
    private readonly _ohs: UIEventSource<OpeningHour[]>;
    public readonly IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    private readonly _backgroundTable: OpeningHoursPickerTable;

    private readonly _weekdays: UIEventSource<UIElement[]> = new UIEventSource<UIElement[]>([]);

    constructor(ohs: UIEventSource<OpeningHour[]>) {
        super();
        this._ohs = ohs;
        this._backgroundTable = new OpeningHoursPickerTable(this._weekdays);
        const self = this;
        
        this._backgroundTable.GetValue().addCallback(oh => {
            if (oh) {
                ohs.data.push(oh);
                ohs.ping();
            }
        });
        
        this._ohs.addCallback(ohs => {
            self._ohs.setData(OpeningHourUtils.MergeTimes(ohs));
        })

        ohs.addCallback(ohs => {
            const perWeekday: UIElement[][] = [];

            for (let i = 0; i < 7; i++) {
                perWeekday[i] = [];
            }

            for (const oh of ohs) {
                const source = new UIEventSource<OpeningHour>(oh)
                source.addCallback(_ => {
                    self._ohs.setData(OpeningHourUtils.MergeTimes(self._ohs.data))
                })
                const r = new OpeningHoursRange(source);
                perWeekday[oh.weekday].push(r);
            }

            for (let i = 0; i < 7; i++) {
                self._weekdays.data[i] = new Combine(perWeekday[i]);
            }
            self._weekdays.ping();


        });

    }

    InnerRender(): string {
        return this._backgroundTable.Render();
    }

    GetValue(): UIEventSource<OpeningHour[]> {
        return this._ohs
    }


    IsValid(t: OpeningHour[]): boolean {
        return true;
    }

}