import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import OpeningHoursRange from "./OpeningHoursRange";
import Combine from "../Base/Combine";
import OpeningHoursPickerTable from "./OpeningHoursPickerTable";
import {OH, OpeningHour} from "./OpeningHours";
import {InputElement} from "../Input/InputElement";

export default class OpeningHoursPicker extends InputElement<OpeningHour[]> {
    private readonly _ohs: UIEventSource<OpeningHour[]>;    
    public readonly IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    private readonly _backgroundTable: OpeningHoursPickerTable;

    private readonly _weekdays: UIEventSource<UIElement[]> = new UIEventSource<UIElement[]>([]);

    constructor(ohs: UIEventSource<OpeningHour[]> = new UIEventSource<OpeningHour[]>([])) {
        super();
        this._ohs = ohs;
        this._backgroundTable = new OpeningHoursPickerTable(this._weekdays, this._ohs);
        const self = this;
        
        
        this._ohs.addCallback(ohs => {
            self._ohs.setData(OH.MergeTimes(ohs));
        })

        ohs.addCallbackAndRun(ohs => {
            const perWeekday: UIElement[][] = [];
            for (let i = 0; i < 7; i++) {
                perWeekday[i] = [];
            }

            for (const oh of ohs) {
                const source = new UIEventSource<OpeningHour>(oh)
                source.addCallback(_ => {
                    self._ohs.setData(OH.MergeTimes(self._ohs.data))
                })
                const r = new OpeningHoursRange(source, `oh-table-${this._backgroundTable.id}`);
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