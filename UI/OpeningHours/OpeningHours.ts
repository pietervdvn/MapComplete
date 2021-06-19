import {Utils} from "../../Utils";

export interface OpeningHour {
    weekday: number, // 0 is monday, 1 is tuesday, ...
    startHour: number,
    startMinutes: number,
    endHour: number,
    endMinutes: number
}

/**
 * Various utilities manipulating opening hours
 */
export class OH {


    private static readonly days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
    private static readonly daysIndexed = {
        mo: 0,
        tu: 1,
        we: 2,
        th: 3,
        fr: 4,
        sa: 5,
        su: 6
    }

    public static hhmm(h: number, m: number): string {
        if (h == 24) {
            return "00:00";
        }
        return Utils.TwoDigits(h) + ":" + Utils.TwoDigits(m);
    }

    public static ToString(ohs: OpeningHour[]) {
        if (ohs.length == 0) {
            return "";
        }
        const partsPerWeekday: string [][] = [[], [], [], [], [], [], []];


        for (const oh of ohs) {
            partsPerWeekday[oh.weekday].push(OH.hhmm(oh.startHour, oh.startMinutes) + "-" + OH.hhmm(oh.endHour, oh.endMinutes));
        }

        const stringPerWeekday = partsPerWeekday.map(parts => parts.sort().join(", "));

        const rules = [];

        let rangeStart = 0;
        let rangeEnd = 0;

        function pushRule() {
            const rule = stringPerWeekday[rangeStart];
            if (rule === "") {
                return;
            }
            if (rangeStart == (rangeEnd - 1)) {
                rules.push(
                    `${OH.days[rangeStart]} ${rule}`
                );
            } else {
                rules.push(
                    `${OH.days[rangeStart]}-${OH.days[rangeEnd - 1]} ${rule}`
                );
            }
        }

        for (; rangeEnd < 7; rangeEnd++) {

            if (stringPerWeekday[rangeStart] != stringPerWeekday[rangeEnd]) {
                pushRule();
                rangeStart = rangeEnd
            }

        }
        pushRule();

        const oh = rules.join("; ")
        if (oh === "Mo-Su 00:00-00:00") {
            return "24/7"
        }
        return oh;
    }

    /**
     * Merge duplicate opening-hour element in place.
     * Returns true if something changed
     * @param ohs
     * @constructor
     */
    public static MergeTimes(ohs: OpeningHour[]): OpeningHour[] {
        const queue = ohs.map(oh => {
            if (oh.endHour === 0 && oh.endMinutes === 0) {
                const newOh = {
                        ...oh
                }
                newOh.endHour = 24
                return newOh
            }
            return oh;
        });
        const newList = [];
        while (queue.length > 0) {
            let maybeAdd = queue.pop();

            let doAddEntry = true;
            if (maybeAdd.weekday == undefined) {
                doAddEntry = false;
            }

            for (let i = newList.length - 1; i >= 0 && doAddEntry; i--) {
                let guard = newList[i];
                if (maybeAdd.weekday != guard.weekday) {
                    // Not the same day
                    continue
                }

                if (OH.startTimeLiesInRange(maybeAdd, guard) && OH.endTimeLiesInRange(maybeAdd, guard)) {
                    // Guard fully covers 'maybeAdd': we can safely ignore maybeAdd
                    doAddEntry = false;
                    break;
                }

                if (OH.startTimeLiesInRange(guard, maybeAdd) && OH.endTimeLiesInRange(guard, maybeAdd)) {
                    // 'maybeAdd'  fully covers Guard - the guard is killed
                    newList.splice(i, 1);
                    break;
                }

                if (OH.startTimeLiesInRange(maybeAdd, guard) || OH.endTimeLiesInRange(maybeAdd, guard)
                    || OH.startTimeLiesInRange(guard, maybeAdd) || OH.endTimeLiesInRange(guard, maybeAdd)) {
                    // At this point, the maybeAdd overlaps the guard: we should extend the guard and retest it
                    newList.splice(i, 1);
                    let startHour = guard.startHour;
                    let startMinutes = guard.startMinutes;
                    if (OH.startTime(maybeAdd) < OH.startTime(guard)) {
                        startHour = maybeAdd.startHour;
                        startMinutes = maybeAdd.startMinutes;
                    }

                    let endHour = guard.endHour;
                    let endMinutes = guard.endMinutes;
                    if (OH.endTime(maybeAdd) > OH.endTime(guard)) {
                        endHour = maybeAdd.endHour;
                        endMinutes = maybeAdd.endMinutes;
                    }

                    queue.push({
                        startHour: startHour,
                        startMinutes: startMinutes,
                        endHour: endHour,
                        endMinutes: endMinutes,
                        weekday: guard.weekday
                    });

                    doAddEntry = false;
                    break;
                }

            }
            if (doAddEntry) {
                newList.push(maybeAdd);
            }
        }

        // New list can only differ from the old list by merging entries
        // This means that the list is changed only if the lengths are different.
        // If the lengths are the same, we might just as well return the old list and be a bit more stable
        if (newList.length !== ohs.length) {
            return newList;
        } else {
            return ohs;
        }

    }

    /**
     * Gives the number of hours since the start of day.
     * E.g.
     * startTime({startHour: 9, startMinuts: 15}) == 9.25
     * @param oh
     */
    public static startTime(oh: OpeningHour): number {
        return oh.startHour + oh.startMinutes / 60;
    }

    public static endTime(oh: OpeningHour): number {
        return oh.endHour + oh.endMinutes / 60;
    }

    public static startTimeLiesInRange(checked: OpeningHour, mightLieIn: OpeningHour) {
        return OH.startTime(mightLieIn) <= OH.startTime(checked) &&
            OH.startTime(checked) <= OH.endTime(mightLieIn)
    }

    public static endTimeLiesInRange(checked: OpeningHour, mightLieIn: OpeningHour) {
        return OH.startTime(mightLieIn) <= OH.endTime(checked) &&
            OH.endTime(checked) <= OH.endTime(mightLieIn)
    }

    public static parseHHMMRange(hhmmhhmm: string): {
        startHour: number,
        startMinutes: number,
        endHour: number,
        endMinutes: number
    } {
        if (hhmmhhmm == "off") {
            return null;
        }

        const timings = hhmmhhmm.split("-");
        const start = OH.parseHHMM(timings[0])
        const end = OH.parseHHMM(timings[1]);
        return {
            startHour: start.hours,
            startMinutes: start.minutes,
            endHour: end.hours,
            endMinutes: end.minutes
        }
    }

    public static ParseRule(rule: string): OpeningHour[] {
        try {
            if (rule.trim() == "24/7") {
                return OH.multiply([0, 1, 2, 3, 4, 5, 6], [{
                    startHour: 0,
                    startMinutes: 0,
                    endHour: 24,
                    endMinutes: 0
                }]);
            }

            const split = rule.trim().replace(/, */g, ",").split(" ");
            if (split.length == 1) {
                // First, try to parse this rule as a rule without weekdays
                let timeranges = OH.ParseHhmmRanges(rule);
                let weekdays = [0, 1, 2, 3, 4, 5, 6];
                return OH.multiply(weekdays, timeranges);
            }

            if (split.length == 2) {
                const weekdays = OH.ParseWeekdayRanges(split[0]);
                const timeranges = OH.ParseHhmmRanges(split[1]);
                return OH.multiply(weekdays, timeranges);
            }
            return null;
        } catch (e) {
            console.log("Could not parse weekday rule ", rule);
            return null;
        }
    }

    public static ParsePHRule(str: string): {
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

        if (str === "PH open") {
            return {
                mode: "open"
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

    static Parse(rules: string) {
        if (rules === undefined || rules === "") {
            return []
        }

        const ohs = []

        const split = rules.split(";");

        for (const rule of split) {
            if (rule === "") {
                continue;
            }
            try {
                const parsed = OH.ParseRule(rule)
                if (parsed !== null) {
                    ohs.push(...parsed);
                }
            } catch (e) {
                console.error("Could not parse ", rule, ": ", e)
            }
        }

        return ohs;
    }

    /*
 This function converts a number of ranges (generated by OpeningHours.js) into all the hours of day that a change occurs.
 E.g.
 Monday, some business is opended from 9:00 till 17:00
 Tuesday from 9:30 till 18:00
 Wednesday from 9:30 till 12:30
 This function will extract all those moments of change and will return 9:00, 9:30, 12:30, 17:00 and 18:00
 This list will be sorted
 */
    public static allChangeMoments(ranges: {
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

                // The number of seconds since the start of the day
                // @ts-ignore
                const changeMoment: number = (range.startDate - startOfDay) / 1000;
                if (changeHours.indexOf(changeMoment) < 0) {
                    changeHours.push(changeMoment);
                    changeHourText.push(OH.hhmm(range.startDate.getHours(), range.startDate.getMinutes()))
                }

                // The number of seconds till between the start of the day and closing
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

        // Note that 'changeHours' and 'changeHourText' will be more or less in sync - one is in numbers, the other in 'HH:MM' format.
        // But both can be sorted without problem; they'll stay in sync
        changeHourText.sort();
        changeHours.sort();
        extrachangeHourText.sort();
        extrachangeHours.sort();

        changeHourText.push(...extrachangeHourText);
        changeHours.push(...extrachangeHours);

        return [changeHours, changeHourText]
    }

    /*
 Calculates when the business is opened (or on holiday) between two dates.
 Returns a matrix of ranges, where [0] is a list of ranges when it is opened on monday, [1] is a list of ranges for tuesday, ...
  */
    public static GetRanges(oh: any, from: Date, to: Date): ({
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

            if (value.startDate < from) {
                continue;
            }
            // Get day: sunday is 0, monday is 1. We move everything so that monday == 0
            values[(value.startDate.getDay() + 6) % 7].push(value);
        }
        return values;
    }

    private static parseHHMM(hhmm: string): { hours: number, minutes: number } {
        if (hhmm === undefined || hhmm == null) {
            return null;
        }
        const spl = hhmm.trim().split(":");
        if (spl.length != 2) {
            return null;
        }
        const hm = {hours: Number(spl[0].trim()), minutes: Number(spl[1].trim())};
        if (isNaN(hm.hours) || isNaN(hm.minutes)) {
            return null;
        }
        return hm;
    }

    private static ParseHhmmRanges(hhmms: string): {
        startHour: number,
        startMinutes: number,
        endHour: number,
        endMinutes: number
    }[] {
        if (hhmms === "off") {
            return [];
        }
        return hhmms.split(",")
            .map(s => s.trim())
            .filter(str => str !== "")
            .map(OH.parseHHMMRange)
            .filter(v => v != null)
    }

    private static ParseWeekday(weekday: string): number {
        return OH.daysIndexed[weekday.trim().toLowerCase()];
    }

    private static ParseWeekdayRange(weekdays: string): number[] {
        const split = weekdays.split("-");
        if (split.length == 1) {
            const parsed = OH.ParseWeekday(weekdays);
            if (parsed == null) {
                return null;
            }
            return [parsed];
        } else if (split.length == 2) {
            let start = OH.ParseWeekday(split[0]);
            let end = OH.ParseWeekday(split[1]);
            if ((start ?? null) === null || (end ?? null) === null) {
                return null;
            }
            let range = [];
            for (let i = start; i <= end; i++) {
                range.push(i);
            }
            return range;
        } else {
            return null;
        }
    }

    private static ParseWeekdayRanges(weekdays: string): number[] {
        let ranges = [];
        let split = weekdays.split(",");
        for (const weekday of split) {
            const parsed = OH.ParseWeekdayRange(weekday)
            if (parsed === undefined || parsed === null) {
                return null;
            }
            ranges.push(...parsed);
        }
        return ranges;
    }

    private static multiply(weekdays: number[], timeranges: { startHour: number, startMinutes: number, endHour: number, endMinutes: number }[]) {
        if ((weekdays ?? null) == null || (timeranges ?? null) == null) {
            return null;
        }
        const ohs: OpeningHour[] = []
        for (const timerange of timeranges) {
            for (const weekday of weekdays) {
                ohs.push({
                    weekday: weekday,
                    startHour: timerange.startHour, startMinutes: timerange.startMinutes,
                    endHour: timerange.endHour, endMinutes: timerange.endMinutes,
                });
            }
        }
        return ohs;
    }

}

