import ChartJs, { ChartJsColours } from "../Base/ChartJs"
import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"
import { ChartConfiguration } from "chart.js"
import Combine from "../Base/Combine"
import { TagUtils } from "../../Logic/Tags/TagUtils"
import { Utils } from "../../Utils"
import { OsmFeature } from "../../Models/OsmFeature"

export interface TagRenderingChartOptions {
    groupToOtherCutoff?: 3 | number
    sort?: boolean
    hideUnkown?: boolean
    hideNotApplicable?: boolean
}

export class StackedRenderingChart extends ChartJs {
    constructor(
        tr: TagRenderingConfig,
        features: (OsmFeature & { properties: { date: string } })[],
        options?: {
            period: "day" | "month"
            groupToOtherCutoff?: 3 | number
            // If given, take the sum of these fields to get the feature weight
            sumFields?: ReadonlyArray<string>
            hideUnknown?: boolean
            hideNotApplicable?: boolean
        }
    ) {
        const { labels, data } = TagRenderingChart.extractDataAndLabels(tr, features, {
            sort: true,
            groupToOtherCutoff: options?.groupToOtherCutoff,
            hideNotApplicable: options?.hideNotApplicable,
            hideUnkown: options?.hideUnknown,
        })
        if (labels === undefined || data === undefined) {
            console.error(
                "Could not extract data and labels for ",
                tr,
                " with features",
                features,
                ": no labels or no data"
            )
            throw "No labels or data given..."
        }

        for (let i = labels.length; i >= 0; i--) {
            if (data[i]?.length != 0) {
                continue
            }
            data.splice(i, 1)
            labels.splice(i, 1)
        }

        const datasets: {
            label: string /*themename*/
            data: number[] /*counts per day*/
            backgroundColor: string
        }[] = []
        const allDays = StackedRenderingChart.getAllDays(features)
        let trimmedDays = allDays.map((d) => d.substring(0, 10))
        if (options?.period === "month") {
            trimmedDays = trimmedDays.map((d) => d.substring(0, 7))
        }
        trimmedDays = Utils.Dedup(trimmedDays)

        for (let i = 0; i < labels.length; i++) {
            const label = labels[i]
            const changesetsForTheme = data[i]
            const perDay: Record<string, OsmFeature[]> = {}
            for (const changeset of changesetsForTheme) {
                const csDate = new Date(changeset.properties.date)
                Utils.SetMidnight(csDate)
                let str = csDate.toISOString()
                str = str.substr(0, 10)
                if (options?.period === "month") {
                    str = str.substr(0, 7)
                }
                if (perDay[str] === undefined) {
                    perDay[str] = [changeset]
                } else {
                    perDay[str].push(changeset)
                }
            }

            const countsPerDay: number[] = []
            for (let i = 0; i < trimmedDays.length; i++) {
                const day = trimmedDays[i]

                const featuresForDay = perDay[day]
                if (!featuresForDay) {
                    continue
                }
                if (options.sumFields !== undefined) {
                    let sum = 0
                    for (const featuresForDayElement of featuresForDay) {
                        const props = featuresForDayElement.properties
                        for (const key of options.sumFields) {
                            if (!props[key]) {
                                continue
                            }
                            const v = Number(props[key])
                            if (isNaN(v)) {
                                continue
                            }
                            sum += v
                        }
                    }
                    countsPerDay[i] = sum
                } else {
                    countsPerDay[i] = featuresForDay?.length ?? 0
                }
            }
            let backgroundColor =
                ChartJsColours.borderColors[i % ChartJsColours.borderColors.length]
            if (label === "Unknown") {
                backgroundColor = ChartJsColours.unknownBorderColor
            }
            if (label === "Other") {
                backgroundColor = ChartJsColours.otherBorderColor
            }
            datasets.push({
                data: countsPerDay,
                backgroundColor,
                label,
            })
        }

        const perDayData = {
            labels: trimmedDays,
            datasets,
        }

        const config = <ChartConfiguration>{
            type: "bar",
            data: perDayData,
            options: {
                responsive: true,
                legend: {
                    display: false,
                },
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                    },
                },
            },
        }
        super(config)
    }

    public static getAllDays(
        features: (OsmFeature & { properties: { date: string } })[]
    ): string[] {
        let earliest: Date = undefined
        let latest: Date = undefined
        const allDates = new Set<string>()
        features.forEach((value) => {
            const d = new Date(value.properties.date)
            Utils.SetMidnight(d)

            if (earliest === undefined) {
                earliest = d
            } else if (d < earliest) {
                earliest = d
            }
            if (latest === undefined) {
                latest = d
            } else if (d > latest) {
                latest = d
            }
            allDates.add(d.toISOString())
        })

        while (earliest < latest) {
            earliest.setDate(earliest.getDate() + 1)
            allDates.add(earliest.toISOString())
        }
        const days = Array.from(allDates)
        days.sort()
        return days
    }
}

export default class TagRenderingChart extends Combine {
    /**
     * Creates a chart about this tagRendering for the given data
     */
    constructor(
        features: { properties: Record<string, string> }[],
        tagRendering: TagRenderingConfig,
        options?: TagRenderingChartOptions & {
            chartclasses?: string
            chartstyle?: string
            includeTitle?: boolean
            chartType?: "pie" | "bar" | "doughnut"
        }
    ) {
        if (tagRendering.mappings?.length === 0 && tagRendering.freeform?.key === undefined) {
            super([])
            this.SetClass("hidden")
            return
        }

        const { labels, data } = TagRenderingChart.extractDataAndLabels(
            tagRendering,
            features,
            options
        )
        if (labels === undefined || data === undefined) {
            super([])
            this.SetClass("hidden")
            return
        }

        const borderColor = [
            ChartJsColours.unknownBorderColor,
            ChartJsColours.otherBorderColor,
            ChartJsColours.notApplicableBorderColor,
        ]
        const backgroundColor = [
            ChartJsColours.unknownColor,
            ChartJsColours.otherColor,
            ChartJsColours.notApplicableColor,
        ]

        while (borderColor.length < data.length) {
            borderColor.push(...ChartJsColours.borderColors)
            backgroundColor.push(...ChartJsColours.backgroundColors)
        }

        for (let i = data.length; i >= 0; i--) {
            if (data[i]?.length === 0) {
                labels.splice(i, 1)
                data.splice(i, 1)
                borderColor.splice(i, 1)
                backgroundColor.splice(i, 1)
            }
        }

        let barchartMode = tagRendering.multiAnswer
        if (labels.length > 9) {
            barchartMode = true
        }

        const config = <ChartConfiguration>{
            type: options.chartType ?? (barchartMode ? "bar" : "doughnut"),
            data: {
                labels,
                datasets: [
                    {
                        data: data.map((l) => l.length),
                        backgroundColor,
                        borderColor,
                        borderWidth: 1,
                        label: undefined,
                    },
                ],
            },
            options: {
                plugins: {
                    legend: {
                        display: !barchartMode,
                    },
                },
            },
        }

        const chart = new ChartJs(config).SetClass(options?.chartclasses ?? "w-32 h-32")

        if (options.chartstyle !== undefined) {
            chart.SetStyle(options.chartstyle)
        }

        super([
            options?.includeTitle ? tagRendering.question.Clone() ?? tagRendering.id : undefined,
            chart,
        ])

        this.SetClass("block")
    }

    public static extractDataAndLabels<T extends { properties: Record<string, string> }>(
        tagRendering: TagRenderingConfig,
        features: T[],
        options?: TagRenderingChartOptions
    ): { labels: string[]; data: T[][] } {
        const mappings = tagRendering.mappings ?? []

        options = options ?? {}
        const unknownCount: T[] = []
        const categoryCounts: T[][] = mappings.map(() => [])
        const otherCounts: Record<string, T[]> = {}
        const notApplicable: T[] = []
        for (const feature of features) {
            const props = feature.properties
            if (
                tagRendering.condition !== undefined &&
                !tagRendering.condition.matchesProperties(props)
            ) {
                notApplicable.push(feature)
                continue
            }

            if (!tagRendering.IsKnown(props)) {
                unknownCount.push(feature)
                continue
            }
            let foundMatchingMapping = false
            if (!tagRendering.multiAnswer) {
                for (let i = 0; i < mappings.length; i++) {
                    const mapping = mappings[i]
                    if (mapping.if.matchesProperties(props)) {
                        categoryCounts[i].push(feature)
                        foundMatchingMapping = true
                        break
                    }
                }
            } else {
                for (let i = 0; i < mappings.length; i++) {
                    const mapping = mappings[i]
                    if (TagUtils.MatchesMultiAnswer(mapping.if, props)) {
                        categoryCounts[i].push(feature)
                        foundMatchingMapping = true
                    }
                }
            }
            if (!foundMatchingMapping) {
                if (
                    tagRendering.freeform?.key !== undefined &&
                    props[tagRendering.freeform.key] !== undefined
                ) {
                    const otherValue = props[tagRendering.freeform.key]
                    otherCounts[otherValue] = otherCounts[otherValue] ?? []
                    otherCounts[otherValue].push(feature)
                } else {
                    unknownCount.push(feature)
                }
            }
        }

        if (unknownCount.length + notApplicable.length === features.length) {
            console.log("Returning no label nor data: all features are unkown or notApplicable")
            return { labels: undefined, data: undefined }
        }

        const otherGrouped: T[] = []
        const otherLabels: string[] = []
        const otherData: T[][] = []
        const sortedOtherCounts: [string, T[]][] = []
        for (const v in otherCounts) {
            sortedOtherCounts.push([v, otherCounts[v]])
        }
        if (options?.sort) {
            sortedOtherCounts.sort((a, b) => b[1].length - a[1].length)
        }
        for (const [v, count] of sortedOtherCounts) {
            if (count.length >= (options.groupToOtherCutoff ?? 3)) {
                otherLabels.push(v)
                otherData.push(otherCounts[v])
            } else {
                otherGrouped.push(...count)
            }
        }

        const labels = []
        const data: T[][] = []

        if (!options.hideUnkown) {
            data.push(unknownCount)
            labels.push("Unknown")
        }
        data.push(otherGrouped)
        labels.push("Other")
        if (!options.hideNotApplicable) {
            data.push(notApplicable)
            labels.push("Not applicable")
        }
        data.push(...categoryCounts, ...otherData)
        labels.push(...(mappings?.map((m) => m.then.txt) ?? []), ...otherLabels)

        return { labels, data }
    }
}
