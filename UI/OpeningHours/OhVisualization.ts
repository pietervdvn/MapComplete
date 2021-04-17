import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import Combine from "../Base/Combine";
import State from "../../State";
import {FixedUiElement} from "../Base/FixedUiElement";
import {OH} from "./OpeningHours";
import Translations from "../i18n/Translations";
import Constants from "../../Models/Constants";
import opening_hours from "opening_hours";

export default class OpeningHoursVisualization extends UIElement {
    private readonly _key: string;

    constructor(tags: UIEventSource<any>, key: string) {
        super(tags);
        this._key = key;
        this.ListenTo(UIEventSource.Chronic(60*1000)); // Automatically reload every minute
        this.ListenTo(UIEventSource.Chronic(500, () => {
            return tags.data._country === undefined;
        }));
        
        
    }
    


    private static GetRanges(oh: any, from: Date, to: Date): ({
        isOpen: boolean,
        isSpecial: boolean,
        comment: string,
        startDate: Date,
        endDate: Date
    }[])[] {


        const values = [[], [], [], [], [], [], []];

        const start = new Date(from);
        // We go one day more into the past, in order to force rendering of holidays in the start of the period
        start.setDate(from.getDate() - 1);
        
        const iterator = oh.getIterator(start);

        let prevValue = undefined;
        while (iterator.advance(to)) {

            if (prevValue) {
                prevValue.endDate = iterator.getDate() as Date
            }
            const endDate = new Date(iterator.getDate()) as Date;
            endDate.setHours(0, 0, 0, 0)
            endDate.setDate(endDate.getDate() + 1);
            const value = {
                isSpecial: iterator.getUnknown(),
                isOpen: iterator.getState(),
                comment: iterator.getComment(),
                startDate: iterator.getDate() as Date,
                endDate: endDate // Should be overwritten by the next iteration
            }
            prevValue = value;

            if (value.comment === undefined && !value.isOpen && !value.isSpecial) {
                // simply closed, nothing special here
                continue;
            }
            
            if(value.startDate < from){
                continue;
            }
            // Get day: sunday is 0, monday is 1. We move everything so that monday == 0
            values[(value.startDate.getDay() + 6) % 7].push(value);
        }
        return values;
    }

    private static getMonday(d) {
        d = new Date(d);
        const day = d.getDay();
        const diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    }


    private allChangeMoments(ranges: {
        isOpen: boolean,
        isSpecial: boolean,
        comment: string,
        startDate: Date,
        endDate: Date
    }[][]): [number[], string[]] {
        const changeHours: number[] = []
        const changeHourText: string[] = [];
        const extrachangeHours: number[] = []
        const extrachangeHourText: string[] = [];

        for (const weekday of ranges) {
            for (const range of weekday) {
                if (!range.isOpen && !range.isSpecial) {
                    continue;
                }
                const startOfDay: Date = new Date(range.startDate);
                startOfDay.setHours(0, 0, 0, 0);
                // @ts-ignore
                const changeMoment: number = (range.startDate - startOfDay) / 1000;
                if (changeHours.indexOf(changeMoment) < 0) {
                    changeHours.push(changeMoment);
                    changeHourText.push(OH.hhmm(range.startDate.getHours(), range.startDate.getMinutes()))
                }

                // @ts-ignore
                let changeMomentEnd: number = (range.endDate - startOfDay) / 1000;
                if (changeMomentEnd >= 24 * 60 * 60) {
                    if (extrachangeHours.indexOf(changeMomentEnd) < 0) {
                        extrachangeHours.push(changeMomentEnd);
                        extrachangeHourText.push(OH.hhmm(range.endDate.getHours(), range.endDate.getMinutes()))
                    }
                } else if (changeHours.indexOf(changeMomentEnd) < 0) {
                    changeHours.push(changeMomentEnd);
                    changeHourText.push(OH.hhmm(range.endDate.getHours(), range.endDate.getMinutes()))
                }
            }
        }

        changeHourText.sort();
        changeHours.sort();
        extrachangeHourText.sort();
        extrachangeHours.sort();
        changeHourText.push(...extrachangeHourText);
        changeHours.push(...extrachangeHours);

        return [changeHours, changeHourText]
    }

    private static readonly weekdays = [
        Translations.t.general.weekdays.abbreviations.monday,
        Translations.t.general.weekdays.abbreviations.tuesday,
        Translations.t.general.weekdays.abbreviations.wednesday,
        Translations.t.general.weekdays.abbreviations.thursday,
        Translations.t.general.weekdays.abbreviations.friday,
        Translations.t.general.weekdays.abbreviations.saturday,
        Translations.t.general.weekdays.abbreviations.sunday,
    ]

    InnerRender(): string {


        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastMonday = OpeningHoursVisualization.getMonday(today);
        const nextSunday = new Date(lastMonday);
        nextSunday.setDate(nextSunday.getDate() + 7);

        const tags = this._source.data;
        if (tags._country === undefined) {
            return "Loading country information...";
        }
        let oh = null;

        try {
            oh = new opening_hours(tags[this._key], {
                lat: tags._lat,
                lon: tags._lon,
                address: {
                    country_code: tags._country
                }
            }, {tag_key: this._key});
        } catch (e) {
            console.log(e);
            const msg = new Combine([Translations.t.general.opening_hours.error_loading,
            State.state?.osmConnection?.userDetails?.data?.csCount >= Constants.userJourney.tagsVisibleAndWikiLinked ?
                 `<span class='subtle'>${e}</span>`
                : ""
            ]);
            return msg.Render();
        }

        if (!oh.getState() && !oh.getUnknown()) {
            // POI is currently closed
            const nextChange: Date = oh.getNextChange();
            if (
                // Shop isn't gonna open anymore in this timerange
                nextSunday < nextChange
                // And we are already in the weekend to show next week
                && (today.getDay() == 0 || today.getDay() == 6)
            ) {
                // We mover further along
                lastMonday.setDate(lastMonday.getDate() + 7);
                nextSunday.setDate(nextSunday.getDate() + 7);
            }
        }

        // ranges[0] are all ranges for monday
        const ranges = OpeningHoursVisualization.GetRanges(oh, lastMonday, nextSunday);
        if (ranges.map(r => r.length).reduce((a, b) => a + b, 0) == 0) {
            // Closed!
            const opensAtDate = oh.getNextChange();
            if(opensAtDate === undefined){
                const comm = oh.getComment() ?? oh.getUnknown();
                if(!!comm){
                    return new FixedUiElement(comm).SetClass("ohviz-closed").Render();
                }
                
                if(oh.getState()){
                    return Translations.t.general.opening_hours.open_24_7.SetClass("ohviz-closed").Render()
                }
                return Translations.t.general.opening_hours.closed_permanently.SetClass("ohviz-closed").Render()
            }
            const moment = `${opensAtDate.getDate()}/${opensAtDate.getMonth() + 1} ${OH.hhmm(opensAtDate.getHours(), opensAtDate.getMinutes())}`
            return Translations.t.general.opening_hours.closed_until.Subs({date: moment}).SetClass("ohviz-closed").Render()
        }

        const isWeekstable = oh.isWeekStable();

        let [changeHours, changeHourText] = this.allChangeMoments(ranges);

        // By default, we always show the range between 8 - 19h, in order to give a stable impression
        // Ofc, a bigger range is used if needed
        const earliestOpen = Math.min(8 * 60 * 60, ...changeHours);
        let latestclose = Math.max(...changeHours);
        // We always make sure there is 30m of leeway in order to give enough room for the closing entry
        latestclose = Math.max(19 * 60 * 60, latestclose + 30 * 60)


        const rows: UIElement[] = [];
        const availableArea = latestclose - earliestOpen;
        // @ts-ignore
        const now = (100 * (((new Date() - today) / 1000) - earliestOpen)) / availableArea;


        let header = "";

        if (now >= 0 && now <= 100) {
            header += new FixedUiElement("").SetStyle(`left:${now}%;`).SetClass("ohviz-now").Render()
        }
        for (const changeMoment of changeHours) {
            const offset = 100 * (changeMoment - earliestOpen) / availableArea;
            if (offset < 0 || offset > 100) {
                continue;
            }
            const el = new FixedUiElement("").SetStyle(`left:${offset}%;`).SetClass("ohviz-line").Render();
            header += el;
        }

        for (let i = 0; i < changeHours.length; i++) {
            let changeMoment = changeHours[i];
            const offset = 100 * (changeMoment - earliestOpen) / availableArea;
            if (offset < 0 || offset > 100) {
                continue;
            }
            const el = new FixedUiElement(
                `<div style='margin-top: ${i % 2 == 0 ? '1.5em;' : "1%"}'>${changeHourText[i]}</div>`
            )
                .SetStyle(`left:${offset}%`)
                .SetClass("ohviz-time-indication").Render();
            header += el;
        }

        rows.push(new Combine([`<td width="5%">&NonBreakingSpace;</td>`,
            `<td style="position:relative;height:2.5em;">${header}</td>`]));

        for (let i = 0; i < 7; i++) {
            const dayRanges = ranges[i];
            const isToday = (new Date().getDay() + 6) % 7 === i;
            let weekday = OpeningHoursVisualization.weekdays[i].Render();

            let dateToShow = ""
            if (!isWeekstable) {
                const day = new Date(lastMonday)
                day.setDate(day.getDate() + i);
                dateToShow = "" + day.getDate() + "/" + (day.getMonth() + 1);
            }

            let innerContent: string[] = [];

            // Add the lines
            for (const changeMoment of changeHours) {
                const offset = 100 * (changeMoment - earliestOpen) / availableArea;
                innerContent.push(new FixedUiElement("").SetStyle(`left:${offset}%;`).SetClass("ohviz-line").Render())
            }

            // Add the actual ranges
            for (const range of dayRanges) {
                if (!range.isOpen && !range.isSpecial) {
                    innerContent.push(
                        new FixedUiElement(range.comment ?? dateToShow).SetClass("ohviz-day-off").Render())
                    continue;
                }

                const startOfDay: Date = new Date(range.startDate);
                startOfDay.setHours(0, 0, 0, 0);
                // @ts-ignore
                const startpoint = (range.startDate - startOfDay) / 1000 - earliestOpen;
                // @ts-ignore
                const width = (100 * (range.endDate - range.startDate) / 1000) / (latestclose - earliestOpen);
                const startPercentage = (100 * startpoint / availableArea);
                innerContent.push(
                    new FixedUiElement(range.comment ?? dateToShow).SetStyle(`left:${startPercentage}%; width:${width}%`).SetClass("ohviz-range").Render())
            }

            // Add line for 'now'
            if (now >= 0 && now <= 100) {
                innerContent.push(new FixedUiElement("").SetStyle(`left:${now}%;`).SetClass("ohviz-now").Render())
            }

            let clss = ""
            if (isToday) {
                clss = "ohviz-today"
            }

            rows.push(new Combine(
                [`<td class="ohviz-weekday ${clss}">${weekday}</td>`,
                    `<td style="position:relative;" class="${clss}">${innerContent.join("")}</td>`]))
        }


        return new Combine([
            "<table class='ohviz' style='width:100%; word-break: normal; word-wrap: normal'>",
            rows.map(el => "<tr>" + el.Render() + "</tr>").join(""),
            "</table>"
        ]).SetClass("ohviz-container").Render();
    }

}