import { Utils } from "../../Utils"
import opening_hours from "opening_hours"
import { Store } from "../../Logic/UIEventSource"
import { Translation, TypedTranslation } from "../i18n/Translation"
import Translations from "../i18n/Translations"

export interface OpeningHour {
    weekday: number // 0 is monday, 1 is tuesday, ...
    startHour: number
    startMinutes: number
    endHour: number
    endMinutes: number
}

export interface OpeningRange {
    isOpen: boolean
    isSpecial: boolean
    comment: string
    startDate: Date
    endDate: Date
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
        su: 6,
    }

    public static hhmm(h: number, m: number): string {
        if (h == 24) {
            return "00:00"
        }
        return Utils.TwoDigits(h) + ":" + Utils.TwoDigits(m)
    }

    /**
     * const rules = [{weekday: 6,endHour: 17,endMinutes: 0,startHour: 13,startMinutes: 0},
     *                {weekday: 1,endHour: 12,endMinutes: 0,startHour: 10,startMinutes: 0}]
     * OH.ToString(rules) // =>  "Tu 10:00-12:00; Su 13:00-17:00"
     *
     * const rules = [{weekday: 3,endHour: 17,endMinutes: 0,startHour: 13,startMinutes: 0}, {weekday: 1,endHour: 12,endMinutes: 0,startHour: 10,startMinutes: 0}]
     * OH.ToString(rules) // => "Tu 10:00-12:00; Th 13:00-17:00"
     *
     * const rules = [ { weekday: 1, endHour: 17, endMinutes: 0, startHour: 13, startMinutes: 0 }, { weekday: 1, endHour: 12, endMinutes: 0, startHour: 10, startMinutes: 0 }]);
     * OH.ToString(rules) // => "Tu 10:00-12:00, 13:00-17:00"
     *
     * const rules = [ { weekday: 0, endHour: 12, endMinutes: 0, startHour: 10, startMinutes: 0 }, { weekday: 0, endHour: 17, endMinutes: 0, startHour: 13, startMinutes: 0}, { weekday: 1, endHour: 17, endMinutes: 0, startHour: 13, startMinutes: 0 }, { weekday: 1, endHour: 12, endMinutes: 0, startHour: 10, startMinutes: 0 }];
     * OH.ToString(rules) // => "Mo-Tu 10:00-12:00, 13:00-17:00"
     *
     * // should merge overlapping opening hours
     * const timerange0 = {weekday: 1, endHour: 23, endMinutes: 30, startHour: 23, startMinutes: 0 }
     * const touchingTimeRange = {  weekday: 1, endHour: 0, endMinutes: 0, startHour: 23, startMinutes: 30 }
     * OH.ToString(OH.MergeTimes([timerange0, touchingTimeRange])) // => "Tu 23:00-00:00"
     *
     * // should merge touching opening hours
     * const timerange0 = {weekday: 1, endHour: 23, endMinutes: 30, startHour: 23, startMinutes: 0 }
     * const overlappingTimeRange =  { weekday: 1, endHour: 24, endMinutes: 0, startHour: 23, startMinutes: 30 }
     * OH.ToString(OH.MergeTimes([timerange0, overlappingTimeRange])) // => "Tu 23:00-00:00"
     *
     */

    public static ToString(ohs: OpeningHour[]) {
        if (ohs.length == 0) {
            return ""
        }
        const partsPerWeekday: string[][] = [[], [], [], [], [], [], []]

        for (const oh of ohs) {
            partsPerWeekday[oh.weekday].push(
                OH.hhmm(oh.startHour, oh.startMinutes) + "-" + OH.hhmm(oh.endHour, oh.endMinutes)
            )
        }

        const stringPerWeekday = partsPerWeekday.map((parts) => parts.sort().join(", "))

        const rules: string[] = []

        let rangeStart = 0
        let rangeEnd = 0

        function pushRule() {
            const rule = stringPerWeekday[rangeStart]
            if (rule === "") {
                return
            }
            if (rangeStart == rangeEnd - 1) {
                rules.push(`${OH.days[rangeStart]} ${rule}`)
            } else {
                rules.push(`${OH.days[rangeStart]}-${OH.days[rangeEnd - 1]} ${rule}`)
            }
        }

        for (; rangeEnd < 7; rangeEnd++) {
            if (stringPerWeekday[rangeStart] != stringPerWeekday[rangeEnd]) {
                pushRule()
                rangeStart = rangeEnd
            }
        }
        pushRule()

        if (rules.length === 1) {
            const rule = rules[0]
            if (rule === "Mo-Su 00:00-00:00") {
                return "24/7"
            }
            if (rule.startsWith("Mo-Su ")) {
                return rule.substring("Mo-Su ".length)
            }
        }

        return rules.join("; ")
    }

    /**
     * Merge duplicate opening-hour element in place.
     * Returns true if something changed
     *
     * // should merge overlapping opening hours
     * const oh1: OpeningHour = { weekday: 0, startHour: 10, startMinutes: 0, endHour: 11, endMinutes: 0 };
     * const oh0: OpeningHour = { weekday: 0, startHour: 10, startMinutes: 30, endHour: 12, endMinutes: 0 };
     * OH.MergeTimes([oh0, oh1]) // => [{ weekday: 0, startHour: 10, startMinutes: 0, endHour: 12, endMinutes: 0 }]
     *
     * // should merge touching opening hours
     * const oh1: OpeningHour = { weekday: 0, startHour: 10, startMinutes: 0, endHour: 11, endMinutes: 0 };
     * const oh0: OpeningHour = { weekday: 0, startHour: 11, startMinutes: 0, endHour: 12, endMinutes: 0 };
     * OH.MergeTimes([oh0, oh1]) // => [{ weekday: 0, startHour: 10, startMinutes: 0, endHour: 12, endMinutes: 0 }]
     *
     * // should merge touching opening hours spanning days
     * const oh0: OpeningHour = { weekday: 0, startHour: 10, startMinutes: 0, endHour: 24, endMinutes: 0 };
     * const oh1: OpeningHour = { weekday: 1, startHour: 0, startMinutes: 0, endHour: 12, endMinutes: 0 };
     * OH.MergeTimes([oh0, oh1]) // => [{ weekday: 0, startHour: 10, startMinutes: 0, endHour: 24, endMinutes: 0 }, { weekday: 1, startHour: 0, startMinutes: 0, endHour: 12, endMinutes: 0 }]
     */
    public static MergeTimes(ohs: OpeningHour[]): OpeningHour[] {
        const queue = ohs.map((oh) => {
            if (oh.endHour === 0 && oh.endMinutes === 0) {
                const newOh = {
                    ...oh,
                }
                newOh.endHour = 24
                return newOh
            }
            return oh
        })
        const newList = []
        while (queue.length > 0) {
            const maybeAdd = queue.pop()

            let doAddEntry = true
            if (maybeAdd.weekday == undefined) {
                doAddEntry = false
            }

            for (let i = newList.length - 1; i >= 0 && doAddEntry; i--) {
                let guard = newList[i]
                if (maybeAdd.weekday != guard.weekday) {
                    // Not the same day
                    continue
                }

                if (
                    OH.startTimeLiesInRange(maybeAdd, guard) &&
                    OH.endTimeLiesInRange(maybeAdd, guard)
                ) {
                    // Guard fully covers 'maybeAdd': we can safely ignore maybeAdd
                    doAddEntry = false
                    break
                }

                if (
                    OH.startTimeLiesInRange(guard, maybeAdd) &&
                    OH.endTimeLiesInRange(guard, maybeAdd)
                ) {
                    // 'maybeAdd'  fully covers Guard - the guard is killed
                    newList.splice(i, 1)
                    break
                }

                if (
                    OH.startTimeLiesInRange(maybeAdd, guard) ||
                    OH.endTimeLiesInRange(maybeAdd, guard) ||
                    OH.startTimeLiesInRange(guard, maybeAdd) ||
                    OH.endTimeLiesInRange(guard, maybeAdd)
                ) {
                    // At this point, the maybeAdd overlaps the guard: we should extend the guard and retest it
                    newList.splice(i, 1)
                    let startHour = guard.startHour
                    let startMinutes = guard.startMinutes
                    if (OH.startTime(maybeAdd) < OH.startTime(guard)) {
                        startHour = maybeAdd.startHour
                        startMinutes = maybeAdd.startMinutes
                    }

                    let endHour = guard.endHour
                    let endMinutes = guard.endMinutes
                    if (OH.endTime(maybeAdd) > OH.endTime(guard)) {
                        endHour = maybeAdd.endHour
                        endMinutes = maybeAdd.endMinutes
                    }

                    queue.push({
                        startHour: startHour,
                        startMinutes: startMinutes,
                        endHour: endHour,
                        endMinutes: endMinutes,
                        weekday: guard.weekday,
                    })

                    doAddEntry = false
                    break
                }
            }
            if (doAddEntry) {
                newList.push(maybeAdd)
            }
        }

        // New list can only differ from the old list by merging entries
        // This means that the list is changed only if the lengths are different.
        // If the lengths are the same, we might just as well return the old list and be a bit more stable
        if (newList.length !== ohs.length) {
            newList.sort((a, b) => b.weekday - a.weekday)
            return newList
        } else {
            return ohs
        }
    }

    /**
     * Gives the number of hours since the start of day.
     * E.g.
     * startTime({startHour: 9, startMinuts: 15}) == 9.25
     * @param oh
     */
    public static startTime(oh: OpeningHour): number {
        return oh.startHour + oh.startMinutes / 60
    }

    public static endTime(oh: OpeningHour): number {
        return oh.endHour + oh.endMinutes / 60
    }

    public static startTimeLiesInRange(checked: OpeningHour, mightLieIn: OpeningHour) {
        return (
            OH.startTime(mightLieIn) <= OH.startTime(checked) &&
            OH.startTime(checked) <= OH.endTime(mightLieIn)
        )
    }

    public static endTimeLiesInRange(checked: OpeningHour, mightLieIn: OpeningHour) {
        return (
            OH.startTime(mightLieIn) <= OH.endTime(checked) &&
            OH.endTime(checked) <= OH.endTime(mightLieIn)
        )
    }

    public static parseHHMMRange(hhmmhhmm: string): {
        startHour: number
        startMinutes: number
        endHour: number
        endMinutes: number
    } {
        if (hhmmhhmm == "off") {
            return null
        }

        const timings = hhmmhhmm.split("-")
        const start = OH.parseHHMM(timings[0])
        const end = OH.parseHHMM(timings[1])
        return {
            startHour: start.hours,
            startMinutes: start.minutes,
            endHour: end.hours,
            endMinutes: end.minutes,
        }
    }

    /**
     * Converts an OH-syntax rule into an object
     *
     *
     * const rules = OH.ParsePHRule("PH 12:00-17:00")
     * rules.mode // => " "
     * rules.start // => "12:00"
     * rules.end // => "17:00"
     *
     * OH.ParseRule("PH 12:00-17:00") // => null
     * OH.ParseRule("Th[-1] off") // => null
     *
     * const rules = OH.Parse("24/7");
     * rules.length // => 7
     * rules[0].startHour // => 0
     * OH.ToString(rules) // => "24/7"
     *
     * const rules = OH.ParseRule("11:00-19:00");
     * rules.length // => 7
     * rules[0].weekday // => 0
     * rules[0].startHour // => 11
     * rules[3].endHour // => 19
     *
     * const rules = OH.ParseRule("Mo-Th 11:00-19:00");
     * rules.length // => 4
     * rules[0].weekday // => 0
     * rules[0].startHour // => 11
     * rules[3].endHour // => 19
     *
     * const rules = OH.ParseRule("Mo 20:00-02:00");
     * rules.length // => 2
     * rules[0].weekday // => 0
     * rules[0].startHour // => 20
     * rules[0].endHour // => 0
     * rules[1].weekday // => 1
     * rules[1].startHour // => 0
     * rules[1].endHour // => 2
     *
     * const rules = OH.ParseRule("Mo 00:00-24:00")
     * rules.length // => 1
     * rules[0].weekday // => 0
     * rules[0].startHour // => 0
     * rules[0].endHour // => 24
     */
    public static ParseRule(rule: string): OpeningHour[] {
        try {
            if (rule.trim() == "24/7") {
                return OH.multiply(
                    [0, 1, 2, 3, 4, 5, 6],
                    [
                        {
                            startHour: 0,
                            startMinutes: 0,
                            endHour: 24,
                            endMinutes: 0,
                        },
                    ]
                )
            }

            const split = rule.trim().replace(/, */g, ",").split(" ")
            if (split.length == 1) {
                // First, try to parse this rule as a rule without weekdays
                let timeranges = OH.ParseHhmmRanges(rule)
                let weekdays = [0, 1, 2, 3, 4, 5, 6]
                return OH.multiply(weekdays, timeranges)
            }

            if (split.length == 2) {
                const weekdays = OH.ParseWeekdayRanges(split[0])
                const timeranges = OH.ParseHhmmRanges(split[1])
                return OH.multiply(weekdays, timeranges)
            }
            return []
        } catch (e) {
            console.log("Could not parse weekday rule ", rule)
            return []
        }
    }

    /**
     *
     * OH.ParsePHRule("PH Off") // => {mode: "off"}
     * OH.ParsePHRule("PH OPEN") // => {mode: "open"}
     * OH.ParsePHRule("PH 10:00-12:00") // => {mode: " ", start: "10:00", end: "12:00"}
     * OH.ParsePHRule(undefined) // => null
     * OH.ParsePHRule(null) // => null
     * OH.ParsePHRule("some random string") // => null
     */
    public static ParsePHRule(str: string): {
        mode: string
        start?: string
        end?: string
    } {
        if (str === undefined || str === null) {
            return null
        }
        str = str.trim()
        if (!str.startsWith("PH")) {
            return null
        }

        str = str.trim()
        if (str.toLowerCase() === "ph off") {
            return {
                mode: "off",
            }
        }

        if (str.toLowerCase() === "ph open") {
            return {
                mode: "open",
            }
        }

        if (!str.startsWith("PH ")) {
            return null
        }
        try {
            const timerange = OH.parseHHMMRange(str.substring(2))
            if (timerange === null) {
                return null
            }

            return {
                mode: " ",
                start: OH.hhmm(timerange.startHour, timerange.startMinutes),
                end: OH.hhmm(timerange.endHour, timerange.endMinutes),
            }
        } catch (e) {
            return null
        }
    }

    public static simplify(str: string): string {
        return OH.ToString(OH.MergeTimes(OH.Parse(str)))
    }

    /**
     * Parses a string into Opening Hours
     */
    public static Parse(rules: string): OpeningHour[] {
        if (rules === undefined || rules === "") {
            return []
        }

        const ohs: OpeningHour[] = []

        const split = rules.split(";")

        for (const rule of split) {
            if (rule === "") {
                continue
            }
            try {
                const parsed = OH.ParseRule(rule)
                if (parsed !== null) {
                    ohs.push(...parsed)
                }
            } catch (e) {
                console.error("Could not parse ", rule, ": ", e)
            }
        }

        return ohs
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
    public static allChangeMoments(
        ranges: {
            isOpen: boolean
            isSpecial: boolean
            comment: string
            startDate: Date
            endDate: Date
        }[][]
    ): [number[], string[]] {
        const changeHours: number[] = []
        const changeHourText: string[] = []

        const extrachangeHours: number[] = []
        const extrachangeHourText: string[] = []

        for (const weekday of ranges) {
            for (const range of weekday) {
                if (!range.isOpen && !range.isSpecial) {
                    continue
                }
                const startOfDay: Date = new Date(range.startDate)
                startOfDay.setHours(0, 0, 0, 0)

                // The number of seconds since the start of the day
                // @ts-ignore
                const changeMoment: number = (range.startDate - startOfDay) / 1000
                if (changeHours.indexOf(changeMoment) < 0) {
                    changeHours.push(changeMoment)
                    changeHourText.push(
                        OH.hhmm(range.startDate.getHours(), range.startDate.getMinutes())
                    )
                }

                // The number of seconds till between the start of the day and closing
                // @ts-ignore
                let changeMomentEnd: number = (range.endDate - startOfDay) / 1000
                if (changeMomentEnd >= 24 * 60 * 60) {
                    if (extrachangeHours.indexOf(changeMomentEnd) < 0) {
                        extrachangeHours.push(changeMomentEnd)
                        extrachangeHourText.push(
                            OH.hhmm(range.endDate.getHours(), range.endDate.getMinutes())
                        )
                    }
                } else if (changeHours.indexOf(changeMomentEnd) < 0) {
                    changeHours.push(changeMomentEnd)
                    changeHourText.push(
                        OH.hhmm(range.endDate.getHours(), range.endDate.getMinutes())
                    )
                }
            }
        }

        // Note that 'changeHours' and 'changeHourText' will be more or less in sync - one is in numbers, the other in 'HH:MM' format.
        // But both can be sorted without problem; they'll stay in sync
        changeHourText.sort()
        changeHours.sort()
        extrachangeHourText.sort()
        extrachangeHours.sort()

        changeHourText.push(...extrachangeHourText)
        changeHours.push(...extrachangeHours)

        return [changeHours, changeHourText]
    }

    public static CreateOhObjectStore(
        tags: Store<Record<string, string>>,
        key: string = "opening_hours",
        prefixToIgnore?: string,
        postfixToIgnore?: string
    ): Store<opening_hours | undefined | "error"> {
        prefixToIgnore ??= ""
        postfixToIgnore ??= ""
        const country = tags.map((tags) => tags._country)
        return tags
            .mapD((tags) => {
                const value: string = tags[key]
                if (value === undefined) {
                    return undefined
                }

                if (
                    (prefixToIgnore || postfixToIgnore) &&
                    value.startsWith(prefixToIgnore) &&
                    value.endsWith(postfixToIgnore)
                ) {
                    return value
                        .substring(prefixToIgnore.length, value.length - postfixToIgnore.length)
                        .trim()
                }
                return value
            })
            .mapD(
                (ohtext) => {
                    try {
                        return OH.CreateOhObject(<any>tags.data, ohtext, country.data)
                    } catch (e) {
                        return "error"
                    }
                },
                [country]
            )
    }

    public static CreateOhObject(
        tags: Record<string, string> & { _lat: number; _lon: number; _country?: string },
        textToParse: string,
        country?: string
    ) {
        // noinspection JSPotentiallyInvalidConstructorUsage
        return new opening_hours(
            textToParse,
            {
                lat: tags._lat,
                lon: tags._lon,
                address: {
                    country_code: country.toLowerCase(),
                    state: undefined,
                },
            },
            <any>{ tag_key: "opening_hours" }
        )
    }

    /**
     * let ranges = <any> [
     *   [
     *     {
     *       "isSpecial": false,
     *       "isOpen": true,
     *       "startDate": new Date("2023-12-11T09:00:00.000Z"),
     *       "endDate": new Date("2023-12-11T12:30:00.000Z")
     *     },
     *     {
     *       "isSpecial": false,
     *       "isOpen": true,
     *       "startDate": new Date("2023-12-11T13:30:00.000Z"),
     *       "endDate": new Date("2023-12-11T18:00:00.000Z")
     *     }
     *   ],
     *   [
     *     {
     *       "isSpecial": false,
     *       "isOpen": true,
     *       "startDate": new Date("2023-12-12T09:00:00.000Z"),
     *       "endDate": new Date("2023-12-12T12:30:00.000Z")
     *     },
     *     {
     *       "isSpecial": false,
     *       "isOpen": true,
     *       "startDate": new Date("2023-12-12T13:30:00.000Z"),
     *       "endDate": new Date("2023-12-12T18:00:00.000Z")
     *     }
     *   ],
     *   [
     *     {
     *       "isSpecial": false,
     *       "isOpen": true,
     *       "startDate": new Date("2023-12-13T09:00:00.000Z"),
     *       "endDate": new Date("2023-12-13T12:30:00.000Z")
     *     },
     *     {
     *       "isSpecial": false,
     *       "isOpen": true,
     *       "startDate": new Date("2023-12-13T13:30:00.000Z"),
     *       "endDate": new Date("2023-12-13T18:00:00.000Z")
     *     }
     *   ],
     *   [
     *     {
     *       "isSpecial": false,
     *       "isOpen": true,
     *       "startDate": new Date("2023-12-14T09:00:00.000Z"),
     *       "endDate": new Date("2023-12-14T12:30:00.000Z")
     *     },
     *     {
     *       "isSpecial": false,
     *       "isOpen": true,
     *       "startDate": new Date("2023-12-14T13:30:00.000Z"),
     *       "endDate": new Date("2023-12-14T18:00:00.000Z")
     *     }
     *   ],
     *   [
     *     {
     *       "isSpecial": false,
     *       "isOpen": true,
     *       "startDate": new Date("2023-12-15T09:00:00.000Z"),
     *       "endDate": new Date("2023-12-15T12:30:00.000Z")
     *     },
     *     {
     *       "isSpecial": false,
     *       "isOpen": true,
     *       "startDate": new Date("2023-12-15T13:30:00.000Z"),
     *       "endDate": new Date("2023-12-15T18:00:00.000Z")
     *     }
     *   ],
     *   [],
     *   []
     * ]
     * OH.weekdaysIdentical(ranges, 0, 1) // => true
     * OH.weekdaysIdentical(ranges, 0, 4) // => true
     * OH.weekdaysIdentical(ranges, 4, 5) // => false
     *
     */

    /**
     * Constructs the opening-ranges for either this week, or for next week if there are no more openings this week
     */
    public static createRangesForApplicableWeek(oh: opening_hours): {
        ranges: OpeningRange[][]
        startingMonday: Date
    } {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const lastMonday = OH.getMondayBefore(today)
        const nextSunday = new Date(lastMonday)
        nextSunday.setDate(nextSunday.getDate() + 7)

        if (!oh.getState() && !oh.getUnknown()) {
            // POI is currently closed
            const nextChange: Date = oh.getNextChange()
            if (
                // Shop isn't gonna open anymore in this timerange
                nextSunday < nextChange &&
                // And we are already in the weekend to show next week
                (today.getDay() == 0 || today.getDay() == 6)
            ) {
                // We move the range to next week!
                lastMonday.setDate(lastMonday.getDate() + 7)
                nextSunday.setDate(nextSunday.getDate() + 7)
            }
        }

        /* We calculate the ranges when it is opened! */
        return { startingMonday: lastMonday, ranges: OH.GetRanges(oh, lastMonday, nextSunday) }
    }

    public static weekdaysIdentical(openingRanges: OpeningRange[][], startday = 0, endday = 4) {
        const monday = openingRanges[startday]
        for (let i = startday + 1; i <= endday; i++) {
            let weekday = openingRanges[i]
            if (weekday.length !== monday.length) {
                return false
            }
            for (let j = 0; j < weekday.length; j++) {
                const openingRange = weekday[j]
                const mondayRange = monday[j]
                if (
                    openingRange.isOpen !== mondayRange.isOpen &&
                    openingRange.isSpecial !== mondayRange.isSpecial &&
                    openingRange.comment !== mondayRange.comment
                ) {
                    return false
                }
                if (
                    openingRange.startDate.toTimeString() !== mondayRange.startDate.toTimeString()
                ) {
                    return false
                }

                if (openingRange.endDate.toTimeString() !== mondayRange.endDate.toTimeString()) {
                    return false
                }
            }
        }
        return true
    }

    /**
     * Calculates when the business is opened (or on holiday) between two dates.
     * Returns a matrix of ranges, where [0] is a list of ranges when it is opened on monday, [1] is a list of ranges for tuesday, ...
     */
    public static GetRanges(oh: opening_hours, from: Date, to: Date): OpeningRange[][] {
        const values = [[], [], [], [], [], [], []]

        const start = new Date(from)
        // We go one day more into the past, in order to force rendering of holidays in the start of the period
        start.setDate(from.getDate() - 1)

        const iterator = oh.getIterator(start)

        let prevValue = undefined
        while (iterator.advance(to)) {
            if (prevValue) {
                prevValue.endDate = iterator.getDate() as Date
            }
            const endDate = new Date(iterator.getDate()) as Date
            endDate.setHours(0, 0, 0, 0)
            endDate.setDate(endDate.getDate() + 1)
            const value = {
                isSpecial: iterator.getUnknown(),
                isOpen: iterator.getState(),
                comment: iterator.getComment(),
                startDate: iterator.getDate() as Date,
                endDate: endDate, // Should be overwritten by the next iteration
            }
            prevValue = value

            if (value.comment === undefined && !value.isOpen && !value.isSpecial) {
                // simply closed, nothing special here
                continue
            }

            if (value.startDate < from) {
                continue
            }
            // Get day: sunday is 0, monday is 1. We move everything so that monday == 0
            values[(value.startDate.getDay() + 6) % 7].push(value)
        }
        return values
    }

    public static getMondayBefore(d) {
        d = new Date(d)
        const day = d.getDay()
        const diff = d.getDate() - day + (day == 0 ? -6 : 1) // adjust when day is sunday
        return new Date(d.setDate(diff))
    }

    /**
     * OH.parseHHMM("12:30") // => {hours: 12, minutes: 30}
     */
    private static parseHHMM(hhmm: string): { hours: number; minutes: number } {
        if (hhmm === undefined || hhmm == null) {
            return null
        }
        const spl = hhmm.trim().split(":")
        if (spl.length != 2) {
            return null
        }
        const hm = { hours: Number(spl[0].trim()), minutes: Number(spl[1].trim()) }
        if (isNaN(hm.hours) || isNaN(hm.minutes)) {
            return null
        }
        return hm
    }

    /**
     * OH.ParseHhmmRanges("20:00-22:15") // => [{startHour: 20, startMinutes: 0, endHour: 22, endMinutes: 15}]
     * OH.ParseHhmmRanges("20:00-02:15") // => [{startHour: 20, startMinutes: 0, endHour: 2, endMinutes: 15}]
     * OH.ParseHhmmRanges("00:00-24:00") // => [{startHour: 0, startMinutes: 0, endHour: 24, endMinutes: 0}]
     */
    private static ParseHhmmRanges(hhmms: string): {
        startHour: number
        startMinutes: number
        endHour: number
        endMinutes: number
    }[] {
        if (hhmms === "off") {
            return []
        }
        return hhmms
            .split(",")
            .map((s) => s.trim())
            .filter((str) => str !== "")
            .map(OH.parseHHMMRange)
            .filter((v) => v != null)
    }

    private static ParseWeekday(weekday: string): number {
        return OH.daysIndexed[weekday.trim().toLowerCase()]
    }

    private static ParseWeekdayRange(weekdays: string): number[] {
        const split = weekdays.split("-")
        if (split.length == 1) {
            const parsed = OH.ParseWeekday(weekdays)
            if (parsed == null) {
                return null
            }
            return [parsed]
        } else if (split.length == 2) {
            let start = OH.ParseWeekday(split[0])
            let end = OH.ParseWeekday(split[1])
            if ((start ?? null) === null || (end ?? null) === null) {
                return null
            }
            let range = []
            for (let i = start; i <= end; i++) {
                range.push(i)
            }
            return range
        } else {
            return null
        }
    }

    private static ParseWeekdayRanges(weekdays: string): number[] {
        let ranges = []
        let split = weekdays.split(",")
        for (const weekday of split) {
            const parsed = OH.ParseWeekdayRange(weekday)
            if (parsed === undefined || parsed === null) {
                return null
            }
            ranges.push(...parsed)
        }
        return ranges
    }

    private static multiply(
        weekdays: number[],
        timeranges: {
            startHour: number
            startMinutes: number
            endHour: number
            endMinutes: number
        }[]
    ): {
        weekday: number
        startHour: number
        startMinutes: number
        endHour: number
        endMinutes: number
    }[] {
        if ((weekdays ?? null) == null || (timeranges ?? null) == null) {
            return null
        }
        const ohs: OpeningHour[] = []
        for (const timerange of timeranges) {
            const overMidnight =
                !(timerange.endHour === 0 && timerange.endMinutes === 0) &&
                (timerange.endHour < timerange.startHour ||
                    (timerange.endHour == timerange.startHour &&
                        timerange.endMinutes < timerange.startMinutes))
            for (const weekday of weekdays) {
                if (!overMidnight) {
                    ohs.push({
                        weekday: weekday,
                        startHour: timerange.startHour,
                        startMinutes: timerange.startMinutes,
                        endHour: timerange.endHour,
                        endMinutes: timerange.endMinutes,
                    })
                } else {
                    ohs.push({
                        weekday: weekday,
                        startHour: timerange.startHour,
                        startMinutes: timerange.startMinutes,
                        endHour: 0,
                        endMinutes: 0,
                    })
                    ohs.push({
                        weekday: (weekday + 1) % 7,
                        startHour: 0,
                        startMinutes: 0,
                        endHour: timerange.endHour,
                        endMinutes: timerange.endMinutes,
                    })
                }
            }
        }
        return ohs
    }
}

export class ToTextualDescription {
    /**
     * const oh = new opening_hours("mon 12:00-16:00")
     * const ranges = OH.createRangesForApplicableWeek(oh)
     * const tr = ToTextualDescription.createTextualDescriptionFor(oh, ranges.ranges)
     * tr.textFor("en") // => "On monday from 12:00 till 16:00"
     * tr.textFor("nl") // => "Op maandag van 12:00 tot 16:00"
     *
     * const oh = new opening_hours("mon 12:00-16:00; tu 13:00-14:00")
     * const ranges = OH.createRangesForApplicableWeek(oh)
     * const tr = ToTextualDescription.createTextualDescriptionFor(oh, ranges.ranges)
     * tr.textFor("en") // => "On monday from 12:00 till 16:00. On tuesday from 13:00 till 14:00"
     * tr.textFor("nl") // => "Op maandag van 12:00 tot 16:00. Op dinsdag van 13:00 tot 14:00"
     */
    public static createTextualDescriptionFor(
        oh: opening_hours,
        ranges: OpeningRange[][]
    ): Translation {
        const t = Translations.t.general.opening_hours

        if (!ranges?.some((r) => r.length > 0)) {
            // <!-- No changes to the opening hours in the next week; probably open 24/7, permanently closed, opening far in the future or unkown -->
            if (oh.getNextChange() === undefined) {
                // <!-- Permenantly in the same state -->
                if (oh.getComment() !== undefined) {
                    return new Translation({ "*": oh.getComment() })
                }

                if (oh.getUnknown()) {
                    return t.unknown
                }
                if (oh.getState()) {
                    return t.open_24_7
                } else {
                    return t.closed_permanently
                }
            }
        }

        // Opened at a more-or-less normal, weekly rhythm
        if (OH.weekdaysIdentical(ranges, 0, 6)) {
            return t.all_days_from.Subs({ ranges: ToTextualDescription.createRangesFor(ranges[0]) })
        }

        const result: Translation[] = []
        const weekdays = [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
        ]

        function addRange(start: number, end: number) {
            for (let i = start; i <= end; i++) {
                const day = weekdays[i]
                if (ranges[i]?.length > 0) {
                    result.push(
                        t[day].Subs({ ranges: ToTextualDescription.createRangesFor(ranges[i]) })
                    )
                }
            }
        }

        if (OH.weekdaysIdentical(ranges, 0, 4)) {
            if (ranges[0].length > 0) {
                result.push(
                    t.on_weekdays.Subs({ ranges: ToTextualDescription.createRangesFor(ranges[0]) })
                )
            }
        } else {
            addRange(0, 4)
        }

        if (OH.weekdaysIdentical(ranges, 5, 6)) {
            if (ranges[5].length > 0) {
                result.push(
                    t.on_weekdays.Subs({ ranges: ToTextualDescription.createRangesFor(ranges[5]) })
                )
            }
        } else {
            addRange(5, 6)
        }
        return ToTextualDescription.chain(result)
    }

    private static chain(trs: Translation[]): Translation {
        const languages: Record<string, string> = {}
        for (const tr1 of trs) {
            for (const supportedLanguage of tr1.SupportedLanguages()) {
                languages[supportedLanguage] = "{a}. {b}"
            }
        }
        let chainer = new TypedTranslation<{ a; b }>(languages)
        let tr = trs[0]
        for (let i = 1; i < trs.length; i++) {
            tr = chainer.PartialSubsTr("a", tr).PartialSubsTr("b", trs[i])
        }
        return tr
    }

    private static timeString(date: Date) {
        return OH.hhmm(date.getHours(), date.getMinutes())
    }

    private static createRangeFor(range: OpeningRange): Translation {
        return Translations.t.general.opening_hours.ranges.Subs({
            starttime: ToTextualDescription.timeString(range.startDate),
            endtime: ToTextualDescription.timeString(range.endDate),
        })
    }

    private static createRangesFor(ranges: OpeningRange[]): Translation {
        if (ranges.length === 0) {
            //    return undefined
        }
        let tr = ToTextualDescription.createRangeFor(ranges[0])
        for (let i = 1; i < ranges.length; i++) {
            tr = Translations.t.general.opening_hours.rangescombined.Subs({
                range0: tr,
                range1: ToTextualDescription.createRangeFor(ranges[i]),
            })
        }
        return tr
    }
}
