import ChartJs from "../Base/ChartJs";
import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";
import {ChartConfiguration} from 'chart.js';
import Combine from "../Base/Combine";
import {TagUtils} from "../../Logic/Tags/TagUtils";

export interface TagRenderingChartOptions {
  
    groupToOtherCutoff?: 3 | number,
    sort?: boolean
}

export default class TagRenderingChart extends Combine {

    private static readonly unkownColor = 'rgba(128, 128, 128, 0.2)'
    private static readonly unkownBorderColor = 'rgba(128, 128, 128, 0.2)'

    private static readonly otherColor = 'rgba(128, 128, 128, 0.2)'
    private static readonly otherBorderColor = 'rgba(128, 128, 255)'
    private static readonly notApplicableColor = 'rgba(128, 128, 128, 0.2)'
    private static readonly notApplicableBorderColor = 'rgba(255, 0, 0)'


    public static readonly backgroundColors = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
    ]

    private static readonly borderColors = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ]

    /**
     * Creates a chart about this tagRendering for the given data
     */
    constructor(features: { properties: Record<string, string> }[], tagRendering: TagRenderingConfig, options?: TagRenderingChartOptions & {  chartclasses?: string,
        chartstyle?: string,
        includeTitle?: boolean,
        chartType?: "pie" | "bar" | "doughnut" }) {
        if (tagRendering.mappings?.length === 0 && tagRendering.freeform?.key === undefined) {
            super([])
            this.SetClass("hidden")
            return;
        }

        const {labels, data} = TagRenderingChart.extractDataAndLabels(tagRendering, features, options)
        if (labels === undefined || data === undefined) {
            super([])
            this.SetClass("hidden")
            return 
        }
        
       
        const borderColor = [TagRenderingChart.unkownBorderColor, TagRenderingChart.otherBorderColor, TagRenderingChart.notApplicableBorderColor]
        const backgroundColor = [TagRenderingChart.unkownColor, TagRenderingChart.otherColor, TagRenderingChart.notApplicableColor]


        while (borderColor.length < data.length) {
            borderColor.push(...TagRenderingChart.borderColors)
            backgroundColor.push(...TagRenderingChart.backgroundColors)
        }

        for (let i = data.length; i >= 0; i--) {
            if (data[i]?.length === 0) {
                labels.splice(i, 1)
                data.splice(i, 1)
                borderColor.splice(i, 1)
                backgroundColor.splice(i, 1)
            }
        }
        
        
        
        let barchartMode = tagRendering.multiAnswer;
        if (labels.length > 9) {
            barchartMode = true;
        }

        const config = <ChartConfiguration>{
            type: options.chartType ?? (barchartMode ? 'bar' : 'doughnut'),
            data: {
                labels,
                datasets: [{
                    data: data.map(l => l.length),
                    backgroundColor,
                    borderColor,
                    borderWidth: 1,
                    label: undefined
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: !barchartMode
                    }
                }
            }
        }

        const chart = new ChartJs(config).SetClass(options?.chartclasses ?? "w-32 h-32");

        if (options.chartstyle !== undefined) {
            chart.SetStyle(options.chartstyle)
        }


        super([
            options?.includeTitle ? (tagRendering.question.Clone() ?? tagRendering.id) : undefined,
            chart])

        this.SetClass("block")
    }

    
    public static extractDataAndLabels<T extends {properties: Record<string, string>}>(tagRendering: TagRenderingConfig, features: T[], options?:TagRenderingChartOptions): {labels: string[], data: T[][]} {
        const mappings = tagRendering.mappings ?? []

        options = options ?? {}
        let unknownCount : T[] = [];
        const categoryCounts : T[][]= mappings.map(_ => [])
        const otherCounts: Record<string, T[]> = {}
        let notApplicable : T[] = [];
        for (const feature of features) {
            const props = feature.properties
            if (tagRendering.condition !== undefined && !tagRendering.condition.matchesProperties(props)) {
                notApplicable.push(feature);
                continue;
            }

            if (!tagRendering.IsKnown(props)) {
                unknownCount.push(feature);
                continue;
            }
            let foundMatchingMapping = false;
            if (!tagRendering.multiAnswer) {
                for (let i = 0; i < mappings.length; i++) {
                    const mapping = mappings[i];
                    if (mapping.if.matchesProperties(props)) {
                        categoryCounts[i].push(feature)
                        foundMatchingMapping = true
                        break;
                    }
                }
            } else {
                for (let i = 0; i < mappings.length; i++) {
                    const mapping = mappings[i];
                    if (TagUtils.MatchesMultiAnswer(mapping.if, props)) {
                        categoryCounts[i].push(feature)
                        foundMatchingMapping = true
                    }
                }
            }
            if (!foundMatchingMapping) {
                if (tagRendering.freeform?.key !== undefined && props[tagRendering.freeform.key] !== undefined) {
                    const otherValue = props[tagRendering.freeform.key]
                    otherCounts[otherValue] = (otherCounts[otherValue] ?? [])
                     otherCounts[otherValue]      .push(feature)
                } else {
                    unknownCount.push(feature)
                }
            }
        }

        if (unknownCount.length + notApplicable.length === features.length) {
            console.log("Returning no label nor data: all features are unkown or notApplicable")
            return {labels: undefined, data: undefined}
        }

        let otherGrouped : T[] = [];
        const otherLabels: string[] = []
        const otherData: T[][] = []
        const sortedOtherCounts: [string, T[]][] = []
        for (const v in otherCounts) {
            sortedOtherCounts.push([v, otherCounts[v]]);
        }
        if (options?.sort) {
            sortedOtherCounts.sort((a, b) => b[1].length - a[1].length)
        }
        for (const [v, count] of sortedOtherCounts) {
            if (count.length >= (options.groupToOtherCutoff ?? 3)) {
                otherLabels.push(v)
                otherData.push(otherCounts[v])
            } else {
                otherGrouped.push(...count);
            }
        }


        const labels = ["Unknown", "Other", "Not applicable", ...mappings?.map(m => m.then.txt) ?? [], ...otherLabels]
        const data : T[][] = [unknownCount, otherGrouped, notApplicable, ...categoryCounts, ...otherData]

        return {labels, data}
    }
    
}