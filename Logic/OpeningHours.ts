import {Utils} from "../Utils";

export interface OpeningHour {
    weekday: number, // 0 is monday, 1 is tuesday, ...
    startHour: number,
    startMinutes: number,
    endHour: number,
    endMinutes: number
}

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

    public static ToString(ohs: OpeningHour[]) {
        if (ohs.length == 0) {
            return "";
        }
        const partsPerWeekday: string [][] = [[], [], [], [], [], [], []];

        function hhmm(h, m) {
            return Utils.TwoDigits(h) + ":" + Utils.TwoDigits(m);
        }

        for (const oh of ohs) {
            partsPerWeekday[oh.weekday].push(hhmm(oh.startHour, oh.startMinutes) + "-" + hhmm(oh.endHour, oh.endMinutes));
        }

        const stringPerWeekday = partsPerWeekday.map(parts => parts.sort().join(", "));

        const rules = [];

        let rangeStart = 0;
        let rangeEnd = 0;
        
        function pushRule(){
            const rule = stringPerWeekday[rangeStart];
            if(rule === ""){
                return;
            }
            if (rangeStart == (rangeEnd - 1)) {
                rules.push(
                    `${OH.days[rangeStart]} ${rule}`
                );
            } else {
                rules.push(
                    `${OH.days[rangeStart]}-${OH.days[rangeEnd-1]} ${rule}`
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

        return rules.join("; ") + ";"
    }

    /**
     * Merge duplicate opening-hour element in place.
     * Returns true if something changed
     * @param ohs
     * @constructor
     */
    public static MergeTimes(ohs: OpeningHour[]): OpeningHour[] {
        const queue = [...ohs];
        const newList = [];
        while (queue.length > 0) {
            let maybeAdd = queue.pop();

            let doAddEntry = true;
            if(maybeAdd.weekday == undefined){
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
                        endHour:endHour,
                        endMinutes:endMinutes,
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

    private static startTime(oh: OpeningHour): number {
        return oh.startHour + oh.startMinutes / 60;
    }

    private static endTime(oh: OpeningHour): number {
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

    private static parseHHMM(hhmm: string): { hours: number, minutes: number } {
        const spl = hhmm.trim().split(":");
        return {hours: Number(spl[0].trim()), minutes: Number(spl[1].trim())};
    }

    private static parseHHMMRange(hhmmhhmm: string): {
        startHour: number,
        startMinutes: number,
        endHour: number,
        endMinutes: number
    } {
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

    private static ParseHhmmRanges(hhmms: string): {
        startHour: number,
        startMinutes: number,
        endHour: number,
        endMinutes: number
    }[] {
        return hhmms.split(",")
            .map(s => s.trim())
            .filter(str => str !== "")
            .map(OH.parseHHMMRange)
    }

    private static ParseWeekday(weekday: string): number {
        return OH.daysIndexed[weekday.trim().toLowerCase()];
    }

    private static ParseWeekdayRange(weekdays: string): number[] {
        const split = weekdays.split("-");
        if (split.length == 1) {
            return [OH.ParseWeekday(weekdays)];
        } else if (split.length == 2) {
            let start = OH.ParseWeekday(split[0]);
            let end = OH.ParseWeekday(split[1]);
            let range = [];
            for (let i = start; i <= end; i++) {
                range.push(i);
            }
            return range;
        } else {
            throw "Invalid format: " + weekdays + " is not a weekdays range"
        }
    }

    private static ParseWeekdayRanges(weekdays: string): number[] {
        let ranges = [];
        let split = weekdays.split(",");
        for (const weekday of split) {
            ranges.push(...OH.ParseWeekdayRange(weekday));
        }
        return ranges;
    }

    private static multiply(weekdays: number[], timeranges: { startHour: number, startMinutes: number, endHour: number, endMinutes: number }[]) {
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

    public static ParseRule(rule: string): OpeningHour[] {
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
        throw `Could not parse rule: ${rule} has ${split.length} parts (expected one or two)`;
    }


    static Parse(rules: string) {
        if (rules === undefined || rules === "") {
            return []
        }

        const ohs = []

        const split = rules.split(";");

        for (const rule of split) {
            if(rule === ""){
                continue;
            }
            try {
                ohs.push(...OH.ParseRule(rule));
            } catch (e) {
                console.error("Could not parse ", rule, ": ", e)
            }
        }

        return ohs;
    }
}

