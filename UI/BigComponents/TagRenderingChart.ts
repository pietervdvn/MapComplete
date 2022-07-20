import ChartJs from "../Base/ChartJs";
import {OsmFeature} from "../../Models/OsmFeature";
import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";
import {ChartConfiguration} from 'chart.js';
import Combine from "../Base/Combine";

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
        chartstyle?: string
    }) {

        const mappings = tagRendering.mappings ?? []
        if (mappings.length === 0 && tagRendering.freeform?.key === undefined) {
            super(["TagRendering", tagRendering.id, "does not have mapping or a freeform key - no stats can be made"])
            return;
        }
        let unknownCount = 0;
        let categoryCounts = mappings.map(_ => 0)
        let otherCount = 0;
        let notApplicable = 0;
        for (const feature of features) {
            const props = feature.properties
            if(tagRendering.condition !== undefined && !tagRendering.condition.matchesProperties(props)){
                notApplicable++;
                continue;
            }
            
            if (!tagRendering.IsKnown(props)) {
                unknownCount++;
                continue;
            }
            let foundMatchingMapping = false;
            for (let i = 0; i < mappings.length; i++) {
                const mapping = mappings[i];
                if (mapping.if.matchesProperties(props)) {
                    categoryCounts[i]++
                    foundMatchingMapping = true
                    if (!tagRendering.multiAnswer) {
                        break;
                    }
                }
            }
            if (tagRendering.freeform?.key !== undefined && props[tagRendering.freeform.key] !== undefined) {
                otherCount++
            } else if (!foundMatchingMapping) {
                unknownCount++
            }
        }

        if (unknownCount + notApplicable === features.length) {
            console.log("Totals:", features.length+" elements","tr:", tagRendering, "other",otherCount, "unkown",unknownCount, "na", notApplicable)
            super(["No relevant data for ", tagRendering.id])
            return
        }

        const labels = ["Unknown", "Other", "Not applicable", ...mappings?.map(m => m.then.txt) ?? []]
        const data = [unknownCount, otherCount, notApplicable,...categoryCounts]
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

        if (tagRendering.id === undefined) {
            console.log(tagRendering)
        }
        const config = <ChartConfiguration>{
            type: tagRendering.multiAnswer ? 'bar' : 'doughnut',
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
                        display: !tagRendering.multiAnswer
                    }
                }
            }
        }

        const chart = new ChartJs(config).SetClass(options?.chartclasses ?? "w-32 h-32");

        if (options.chartstyle !== undefined) {
            chart.SetStyle(options.chartstyle)
        }
            

        super([
            tagRendering.question ?? tagRendering.id,
            chart])

        this.SetClass("block")
    }


}