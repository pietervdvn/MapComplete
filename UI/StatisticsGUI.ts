/**
 * The statistics-gui shows statistics from previous MapComplete-edits
 */
import {UIEventSource} from "../Logic/UIEventSource";
import {VariableUiElement} from "./Base/VariableUIElement";
import ChartJs from "./Base/ChartJs";
import Loading from "./Base/Loading";
import {Utils} from "../Utils";
import Combine from "./Base/Combine";
import BaseUIElement from "./BaseUIElement";
import TagRenderingChart from "./BigComponents/TagRenderingChart";
import TagRenderingConfig from "../Models/ThemeConfig/TagRenderingConfig";
import {ChartConfiguration} from "chart.js";
import {FixedUiElement} from "./Base/FixedUiElement";

export default class StatisticsGUI {

    private static readonly homeUrl = "https://raw.githubusercontent.com/pietervdvn/MapComplete/develop/Docs/Tools/stats/"
    private static readonly stats_files = "file-overview.json"
    private readonly index = UIEventSource.FromPromise(Utils.downloadJson(StatisticsGUI.homeUrl + StatisticsGUI.stats_files))


    public setup(): void {


        new VariableUiElement(this.index.map(paths => {
            if (paths === undefined) {
                return new Loading("Loading overview...")
            }
            const downloaded = new UIEventSource<{ features: ChangeSetData[] }[]>([])

            for (const filepath of paths) {
                Utils.downloadJson(StatisticsGUI.homeUrl + filepath).then(data => {
                    data.features.forEach(item => {
                        item.properties = {...item.properties, ...item.properties.metadata}
                        delete item.properties.metadata
                    })
                    downloaded.data.push(data)
                    downloaded.ping()
                })
            }

            return new Combine([
                new VariableUiElement(downloaded.map(dl => "Downloaded " + dl.length + " items")),
                new VariableUiElement(downloaded.map(l => [...l]).stabilized(250).map(downloaded => {
                    const overview = ChangesetsOverview.fromDirtyData([].concat(...downloaded.map(d => d.features)))
                        .filter(cs => new Date(cs.properties.date) > new Date(2022,6,1))
                    
                    //  return overview.breakdownPerDay(overview.themeBreakdown)
                    return overview.breakdownPer(overview.themeBreakdown, "month")
                })).SetClass("block w-full h-full")
            ]).SetClass("block w-full h-full")


        })).SetClass("block w-full h-full").AttachTo("maindiv")

    }
}

class ChangesetsOverview {

    private static readonly theme_remappings = {
        "metamap": "maps",
        "groen": "buurtnatuur",
        "updaten van metadata met mapcomplete": "buurtnatuur",
        "Toevoegen of dit natuurreservaat toegangkelijk is": "buurtnatuur",
        "wiki:mapcomplete/fritures": "fritures",
        "wiki:MapComplete/Fritures": "fritures",
        "lits": "lit",
        "pomp": "cyclofix",
        "wiki:user:joost_schouppe/campersite": "campersite",
        "wiki-user-joost_schouppe-geveltuintjes": "geveltuintjes",
        "wiki-user-joost_schouppe-campersite": "campersite",
        "wiki-User-joost_schouppe-campersite": "campersite",
        "wiki-User-joost_schouppe-geveltuintjes": "geveltuintjes",
        "wiki:User:joost_schouppe/campersite": "campersite",
        "arbres": "arbres_llefia",
        "aed_brugge": "aed",
        "https://llefia.org/arbres/mapcomplete.json": "arbres_llefia",
        "https://llefia.org/arbres/mapcomplete1.json": "arbres_llefia",
        "toevoegen of dit natuurreservaat toegangkelijk is": "buurtnatuur",
        "testing mapcomplete 0.0.0": "buurtnatuur",
        "entrances": "indoor",
        "https://raw.githubusercontent.com/osmbe/play/master/mapcomplete/geveltuinen/geveltuinen.json": "geveltuintjes"
    }
    private readonly _meta: ChangeSetData[];

    public static fromDirtyData(meta: ChangeSetData[]){
        return new ChangesetsOverview(meta.map(cs => ChangesetsOverview.cleanChangesetData(cs)))
    }

    private constructor(meta: ChangeSetData[]) {
        this._meta = meta;
    }

    public filter(predicate: (cs: ChangeSetData) => boolean) {
        return new ChangesetsOverview(this._meta.filter(predicate))
    }

    private static cleanChangesetData(cs: ChangeSetData): ChangeSetData {
        if (cs.properties.theme === undefined) {
            cs.properties.theme = cs.properties.comment.substr(cs.properties.comment.lastIndexOf("#") + 1)
        }
        cs.properties.theme = cs.properties.theme.toLowerCase()
        const remapped = ChangesetsOverview.theme_remappings[cs.properties.theme]
        cs.properties.theme = remapped ?? cs.properties.theme
        if (cs.properties.theme.startsWith("https://raw.githubusercontent.com/")) {
            cs.properties.theme = "gh://" + cs.properties.theme.substr("https://raw.githubusercontent.com/".length)
        }
        if (cs.properties.modify + cs.properties.delete + cs.properties.create == 0) {
            cs.properties.theme = "EMPTY CS"
        }
        try {
            cs.properties.host = new URL(cs.properties.host).host
        } catch (e) {

        }
        return cs
    }

    public themeBreakdown = new TagRenderingConfig({
        id: "theme-breakdown",
        question: "What theme was used?",
        freeform: {
            key: "theme"
        },
        render: "{theme}"
    }, "statistics.themes")

    public ThemeBreakdown(): BaseUIElement {
        return new TagRenderingChart(
            <any>this._meta,
            this.themeBreakdown,
            {
                chartType: "doughnut",
                sort: true,
                groupToOtherCutoff: 25
            }
        )
    }

    public getAllDays(perMonth = false): string[] {
        let earliest: Date = undefined
        let latest: Date = undefined;
        let allDates = new Set<string>();
        this._meta.forEach((value, key) => {
            const d = new Date(value.properties.date);
            Utils.SetMidnight(d)
            if(perMonth){
                d.setUTCDate(1)
            }
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

    public breakdownPer(tr: TagRenderingConfig, period: "day" | "month" = "day" ): BaseUIElement {
        const {labels, data} = TagRenderingChart.extractDataAndLabels(tr, <any>this._meta, {
            sort: true
        })
        if (labels === undefined || data === undefined) {
            return new FixedUiElement("No labels or data given...")
        }
        // labels: ["cyclofix", "buurtnatuur", ...]; data : [ ["cyclofix-changeset", "cyclofix-changeset", ...], ["buurtnatuur-cs", "buurtnatuur-cs"], ... ]

        const datasets: { label: string /*themename*/, data: number[]/*counts per day*/, backgroundColor: string }[] = []

        const allDays = this.getAllDays()
        for (let i = 0; i < labels.length; i++) {
            const label = labels[i];
            const changesetsForTheme = <ChangeSetData[]><any>data[i]
            const perDay: ChangeSetData[][] = []
            for (const day of allDays) {
                const today: ChangeSetData[] = []
                for (const changeset of changesetsForTheme) {
                    const csDate = new Date(changeset.properties.date)
                    Utils.SetMidnight(csDate)
                    if(period === "month"){
                        csDate.setUTCDate(1)
                    }
                    if (csDate.toISOString() !== day) {
                        continue
                    }
                    today.push(changeset)
                }
                perDay.push(today)
            }
            datasets.push({
                data: perDay.map(cs => cs.length),
                backgroundColor: TagRenderingChart.backgroundColors[i % TagRenderingChart.backgroundColors.length],
                label
            })
        }

        const perDayData = {
            labels: allDays.map(d => d.substr(0, d.indexOf("T"))),
            datasets
        }

        const config = <ChartConfiguration>{
            type: 'bar',
            data: perDayData,
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true
                    }
                }
            }
        }

        return new ChartJs(config)
    }

}

interface ChangeSetData {
    "id": number,
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates": [number, number][][]
    },
    "properties": {
        "check_user": null,
        "reasons": [],
        "tags": [],
        "features": [],
        "user": string,
        "uid": string,
        "editor": string,
        "comment": string,
        "comments_count": number,
        "source": string,
        "imagery_used": string,
        "date": string,
        "reviewed_features": [],
        "create": number,
        "modify": number,
        "delete": number,
        "area": number,
        "is_suspect": boolean,
        "harmful": any,
        "checked": boolean,
        "check_date": any,
        "host": string,
        "theme": string,
        "imagery": string,
        "language": string
    }
}
