import { UIEventSource } from "../../Logic/UIEventSource"
import Combine from "../Base/Combine"
import { FixedUiElement } from "../Base/FixedUiElement"
import { OH, OpeningRange, ToTextualDescription } from "./OpeningHours"
import Translations from "../i18n/Translations"
import BaseUIElement from "../BaseUIElement"
import Toggle from "../Input/Toggle"
import { VariableUiElement } from "../Base/VariableUIElement"
import Table from "../Base/Table"
import { Translation } from "../i18n/Translation"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import Loading from "../Base/Loading"
import opening_hours from "opening_hours"
import Locale from "../i18n/Locale"

export default class OpeningHoursVisualization extends Toggle {
    private static readonly weekdays: Translation[] = [
        Translations.t.general.weekdays.abbreviations.monday,
        Translations.t.general.weekdays.abbreviations.tuesday,
        Translations.t.general.weekdays.abbreviations.wednesday,
        Translations.t.general.weekdays.abbreviations.thursday,
        Translations.t.general.weekdays.abbreviations.friday,
        Translations.t.general.weekdays.abbreviations.saturday,
        Translations.t.general.weekdays.abbreviations.sunday,
    ]

    constructor(
        tags: UIEventSource<Record<string, string>>,
        state: { osmConnection?: OsmConnection },
        key: string,
        prefix = "",
        postfix = ""
    ) {
        const openingHoursStore = OH.CreateOhObjectStore(tags, key, prefix, postfix)
        const ohTable = new VariableUiElement(
            openingHoursStore.map((opening_hours_obj) => {
                if (opening_hours_obj === undefined) {
                    return new FixedUiElement("No opening hours defined with key " + key).SetClass(
                        "alert"
                    )
                }

                if (opening_hours_obj === "error") {
                    return Translations.t.general.opening_hours.error_loading
                }

                const applicableWeek = OH.createRangesForApplicableWeek(opening_hours_obj)
                const textual = ToTextualDescription.createTextualDescriptionFor(
                    opening_hours_obj,
                    applicableWeek.ranges
                )
                const vis = OpeningHoursVisualization.CreateFullVisualisation(
                    opening_hours_obj,
                    applicableWeek.ranges,
                    applicableWeek.startingMonday
                )
                Locale.language.mapD((lng) => {
                    console.log("Setting OH description to", lng, textual)
                    vis.ConstructElement().ariaLabel = textual.textFor(lng)
                })
                return vis
            })
        )

        super(
            ohTable,
            new Loading(Translations.t.general.opening_hours.loadingCountry),
            tags.map((tgs) => tgs._country !== undefined)
        )
        this.SetClass("no-weblate")
    }

    private static CreateFullVisualisation(
        oh: opening_hours,
        ranges: OpeningRange[][],
        lastMonday: Date
    ): BaseUIElement {
        /* First, a small sanity check. The business might be permanently closed, 24/7 opened or something other special
         * So, we have to handle the case that ranges is completely empty*/
        if (ranges.filter((range) => range.length > 0).length === 0) {
            return OpeningHoursVisualization.ShowSpecialCase(oh).SetClass(
                "p-4 rounded-full block bg-gray-200"
            )
        }

        /** With all the edge cases handled, we can actually construct the table! **/

        return OpeningHoursVisualization.ConstructVizTable(oh, ranges, lastMonday)
    }

    private static ConstructVizTable(
        oh: any,
        ranges: {
            isOpen: boolean
            isSpecial: boolean
            comment: string
            startDate: Date
            endDate: Date
        }[][],
        rangeStart: Date
    ): BaseUIElement {
        const isWeekstable: boolean = oh.isWeekStable()
        let [changeHours, changeHourText] = OH.allChangeMoments(ranges)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // @ts-ignore
        const todayIndex = Math.ceil((today - rangeStart) / (1000 * 60 * 60 * 24))
        // By default, we always show the range between 8 - 19h, in order to give a stable impression
        // Ofc, a bigger range is used if needed
        const earliestOpen = Math.min(8 * 60 * 60, ...changeHours)
        let latestclose = Math.max(...changeHours)
        // We always make sure there is 30m of leeway in order to give enough room for the closing entry
        latestclose = Math.max(19 * 60 * 60, latestclose + 30 * 60)
        const availableArea = latestclose - earliestOpen

        /*
         * The OH-visualisation is a table, consisting of 8 rows and 2 columns:
         * The first row is a header row (which is NOT passed as header but just as a normal row!) containing empty for the first column and one object giving all the end times
         * The other rows are one for each weekday: the first element showing 'mo', 'tu', ..., the second element containing the bars.
         * Note that the bars are actually an embedded <div> spanning the full width, containing multiple sub-elements
         * */

        const [header, headerHeight] = OpeningHoursVisualization.ConstructHeaderElement(
            availableArea,
            changeHours,
            changeHourText,
            earliestOpen
        )

        const weekdays = []
        const weekdayStyles = []
        for (let i = 0; i < 7; i++) {
            const day = OpeningHoursVisualization.weekdays[i].Clone()
            day.SetClass("w-full h-full flex")

            const rangesForDay = ranges[i].map((range) =>
                OpeningHoursVisualization.CreateRangeElem(
                    availableArea,
                    earliestOpen,
                    latestclose,
                    range,
                    isWeekstable
                )
            )
            const allRanges = new Combine([
                ...OpeningHoursVisualization.CreateLinesAtChangeHours(
                    changeHours,
                    availableArea,
                    earliestOpen
                ),
                ...rangesForDay,
            ]).SetClass("w-full block")

            let extraStyle = ""
            if (todayIndex == i) {
                extraStyle = "background-color: var(--subtle-detail-color);"
                allRanges.SetClass("ohviz-today")
            } else if (i >= 5) {
                extraStyle = "background-color: rgba(230, 231, 235, 1);"
            }
            weekdays.push([day, allRanges])
            weekdayStyles.push([
                "padding-left: 0.5em;" + extraStyle,
                `position: relative;` + extraStyle,
            ])
        }
        return new Table(undefined, [["&nbsp", header], ...weekdays], {
            contentStyle: [
                ["width: 5%", `position: relative; height: ${headerHeight}`],
                ...weekdayStyles,
            ],
        })
            .SetClass("w-full")
            .SetStyle(
                "border-collapse: collapse; word-break; word-break: normal; word-wrap: normal"
            )
    }

    private static CreateRangeElem(
        availableArea: number,
        earliestOpen: number,
        latestclose: number,
        range: {
            isOpen: boolean
            isSpecial: boolean
            comment: string
            startDate: Date
            endDate: Date
        },
        isWeekstable: boolean
    ): BaseUIElement {
        const textToShow =
            range.comment ?? (isWeekstable ? "" : range.startDate.toLocaleDateString())

        if (!range.isOpen && !range.isSpecial) {
            return new FixedUiElement(textToShow).SetClass("ohviz-day-off")
        }

        const startOfDay: Date = new Date(range.startDate)
        startOfDay.setHours(0, 0, 0, 0)
        // @ts-ignore
        const startpoint = (range.startDate - startOfDay) / 1000 - earliestOpen
        // prettier-ignore
        // @ts-ignore
        const width = (100 * (range.endDate - range.startDate) / 1000) / (latestclose - earliestOpen);
        const startPercentage = (100 * startpoint) / availableArea
        return new FixedUiElement(textToShow)
            .SetStyle(`left:${startPercentage}%; width:${width}%`)
            .SetClass("ohviz-range")
    }

    private static CreateLinesAtChangeHours(
        changeHours: number[],
        availableArea: number,
        earliestOpen: number
    ): BaseUIElement[] {
        const allLines: BaseUIElement[] = []
        for (const changeMoment of changeHours) {
            const offset = (100 * (changeMoment - earliestOpen)) / availableArea
            if (offset < 0 || offset > 100) {
                continue
            }
            const el = new FixedUiElement("").SetStyle(`left:${offset}%;`).SetClass("ohviz-line")
            allLines.push(el)
        }
        return allLines
    }

    /**
     * The OH-Visualization header element, a single bar with hours
     * @param availableArea
     * @param changeHours
     * @param changeHourText
     * @param earliestOpen
     * @constructor
     * @private
     */
    private static ConstructHeaderElement(
        availableArea: number,
        changeHours: number[],
        changeHourText: string[],
        earliestOpen: number
    ): [BaseUIElement, string] {
        let header: BaseUIElement[] = []

        header.push(
            ...OpeningHoursVisualization.CreateLinesAtChangeHours(
                changeHours,
                availableArea,
                earliestOpen
            )
        )

        let showHigher = false
        let showHigherUsed = false
        for (let i = 0; i < changeHours.length; i++) {
            let changeMoment = changeHours[i]
            const offset = (100 * (changeMoment - earliestOpen)) / availableArea
            if (offset < 0 || offset > 100) {
                continue
            }

            if (i > 0 && (changeMoment - changeHours[i - 1]) / (60 * 60) < 2) {
                // Quite close to the previous value
                // We alternate the heights
                showHigherUsed = true
                showHigher = !showHigher
            } else {
                showHigher = false
            }

            const el = new Combine([
                new FixedUiElement(changeHourText[i])
                    .SetClass(
                        "relative bg-white pl-1 pr-1 h-3 font-sm rounded-xl border-2 border-black  border-opacity-50"
                    )
                    .SetStyle("left: -50%; word-break:initial"),
            ])
                .SetStyle(`left:${offset}%;margin-top: ${showHigher ? "1.4rem;" : "0.1rem"}`)
                .SetClass("block absolute top-0 m-0 h-full box-border ohviz-time-indication")
            header.push(el)
        }
        const headerElem = new Combine(header)
            .SetClass(`w-full absolute block ${showHigherUsed ? "h-16" : "h-8"}`)
            .SetStyle("margin-top: -1rem")
        const headerHeight = showHigherUsed ? "4rem" : "2rem"
        return [headerElem, headerHeight]
    }

    /*
     * Visualizes any special case: e.g. not open for a long time, 24/7 open, ...
     * */
    private static ShowSpecialCase(oh: any) {
        const opensAtDate = oh.getNextChange()
        if (opensAtDate === undefined) {
            const comm = oh.getComment() ?? oh.getUnknown()
            if (!!comm) {
                return new FixedUiElement(comm)
            }

            if (oh.getState()) {
                return Translations.t.general.opening_hours.open_24_7.Clone()
            }
            return Translations.t.general.opening_hours.closed_permanently.Clone()
        }
        const willOpenAt = `${opensAtDate.getDate()}/${opensAtDate.getMonth() + 1} ${OH.hhmm(
            opensAtDate.getHours(),
            opensAtDate.getMinutes()
        )}`
        return Translations.t.general.opening_hours.closed_until.Subs({ date: willOpenAt })
    }
}
