import ChartJs from "../Base/ChartJs";
import {OsmFeature} from "../../Models/OsmFeature";
import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";
import {ChartConfiguration} from 'chart.js';
import Combine from "../Base/Combine";
import {TagUtils} from "../../Logic/Tags/TagUtils";

export default class TagRenderingChart extends Combine {

    private static readonly unkownColor = 'rgba(128, 128, 128, 0.2)'
    private static readonly unkownBorderColor = 'rgba(128, 128, 128, 0.2)'

    private static readonly otherColor = 'rgba(128, 128, 128, 0.2)'
    private static readonly otherBorderColor = 'rgba(128, 128, 255)'
    private static readonly notApplicableColor = 'rgba(128, 128, 128, 0.2)'
    private static readonly notApplicableBorderColor = 'rgba(255, 0, 0)'


    private static readonly backgroundColors = [
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
    constructor(features: OsmFeature[], tagRendering: TagRenderingConfig, options?: {
        chartclasses?: string,
        chartstyle?: string,
        includeTitle?: boolean,
        groupToOtherCutoff?: 3 | number
    }) {

        const mappings = tagRendering.mappings ?? []
        if (mappings.length === 0 && tagRendering.freeform?.key === undefined) {
            super([])
            this.SetClass("hidden")
            return;
        }
        let unknownCount = 0;
        const categoryCounts = mappings.map(_ => 0)
        const otherCounts: Record<string, number> = {}
        let notApplicable = 0;
        let barchartMode = tagRendering.multiAnswer;
        for (const feature of features) {
            const props = feature.properties
            if (tagRendering.condition !== undefined && !tagRendering.condition.matchesProperties(props)) {
                notApplicable++;
                continue;
            }

            if (!tagRendering.IsKnown(props)) {
                unknownCount++;
                continue;
            }
            let foundMatchingMapping = false;
            if (!tagRendering.multiAnswer) {
                for (let i = 0; i < mappings.length; i++) {
                    const mapping = mappings[i];
                    if (mapping.if.matchesProperties(props)) {
                        categoryCounts[i]++
                        foundMatchingMapping = true
                        break;
                    }
                }
            } else {
                for (let i = 0; i < mappings.length; i++) {
                    const mapping = mappings[i];
                    if (TagUtils.MatchesMultiAnswer( mapping.if, props)) {
                        categoryCounts[i]++
                        foundMatchingMapping = true
                    }
                }
            }
            if (!foundMatchingMapping) {
                if (tagRendering.freeform?.key !== undefined && props[tagRendering.freeform.key] !== undefined) {
                    const otherValue = props[tagRendering.freeform.key]
                    otherCounts[otherValue] = (otherCounts[otherValue] ?? 0) + 1
                } else {
                    unknownCount++
                }
            }
        }

        if (unknownCount + notApplicable === features.length) {
            super([])
            this.SetClass("hidden")
            return
        }

        let otherGrouped = 0;
        const otherLabels: string[] = []
        const otherData : number[] = []
        for (const v in otherCounts) {
            const count = otherCounts[v]
            if(count >= (options.groupToOtherCutoff ?? 3)){
                otherLabels.push(v)
                otherData.push(otherCounts[v])
            }else{
                otherGrouped++;
            }
        }
        

        const labels = ["Unknown", "Other", "Not applicable", ...mappings?.map(m => m.then.txt) ?? [], ...otherLabels]
        const data = [unknownCount, otherGrouped, notApplicable, ...categoryCounts, ... otherData]
        const borderColor = [TagRenderingChart.unkownBorderColor, TagRenderingChart.otherBorderColor, TagRenderingChart.notApplicableBorderColor]
        const backgroundColor = [TagRenderingChart.unkownColor, TagRenderingChart.otherColor, TagRenderingChart.notApplicableColor]

      

        while (borderColor.length < data.length) {
            borderColor.push(...TagRenderingChart.borderColors)
            backgroundColor.push(...TagRenderingChart.backgroundColors)
        }

        for (let i = data.length; i >= 0; i--) {
            if (data[i] === 0) {
                labels.splice(i, 1)
                data.splice(i, 1)
                borderColor.splice(i, 1)
                backgroundColor.splice(i, 1)
            }
        }

        if(labels.length > 9){
            barchartMode = true;
        }

        const config = <ChartConfiguration>{
            type: barchartMode ? 'bar' : 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
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
           options?.includeTitle ?  (tagRendering.question.Clone() ?? tagRendering.id) : undefined,
            chart])

        this.SetClass("block")
    }


}