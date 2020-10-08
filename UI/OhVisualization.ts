import {UIElement} from "./UIElement";
import {UIEventSource} from "../Logic/UIEventSource";
import opening_hours from "opening_hours";

export default class OpeningHoursVisualization extends UIElement {

    constructor(tags: UIEventSource<any>) {
        super(tags);
    }


    private static GetRanges(tags: any, from: Date, to: Date): {
        isOpen: boolean,
        isUnknown: boolean,
        comment: string,
        startDate: Date
    }[] {

        const oh = new opening_hours(tags.opening_hours, {
            lat: tags._lat,
            lon: tags._lon,
            address: {
                country_code: tags._country
            }
        });

        const values = [];

        const iterator = oh.getIterator(from);

        while (iterator.advance(to)) {

            const value = {
                isUnknown: iterator.getUnknown(),
                isOpen: iterator.getState(),
                comment: iterator.getComment(),
                startDate: iterator.getDate()
            }

            if (value.comment === undefined && !value.isOpen && !value.isUnknown) {
                // simply closed, nothing special here
                continue;
            }

            console.log(value)
            values.push(value);


        }
        return values;
    }


    InnerRender(): string {


        const from = new Date("2019-12-31");
        const to = new Date("2020-01-05");

        const ranges = OpeningHoursVisualization.GetRanges(this._source.data, from, to);


        let text = "";
        for (const range of ranges) {
            text += `From${range.startDate} it is${range.isOpen} ${range.comment?? ""}<br/>`
        }

        return text;
    }

}