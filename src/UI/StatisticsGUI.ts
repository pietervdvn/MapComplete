/**
 * The statistics-gui shows statistics from previous MapComplete-edits
 */
import { UIEventSource } from "../Logic/UIEventSource"
import { VariableUiElement } from "./Base/VariableUIElement"
import Loading from "./Base/Loading"
import { Utils } from "../Utils"
import Combine from "./Base/Combine"
import TagRenderingChart, { StackedRenderingChart } from "./BigComponents/TagRenderingChart"
import BaseUIElement from "./BaseUIElement"
import Title from "./Base/Title"
import { FixedUiElement } from "./Base/FixedUiElement"
import List from "./Base/List"
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig"
import mcChanges from "../../src/assets/generated/themes/mapcomplete-changes.json"
import SvelteUIElement from "./Base/SvelteUIElement"
import Filterview from "./BigComponents/Filterview.svelte"
import FilteredLayer from "../Models/FilteredLayer"
import { SubtleButton } from "./Base/SubtleButton"
import { GeoOperations } from "../Logic/GeoOperations"
import { Polygon } from "geojson"
import { Feature } from "geojson"

class StatsticsForOverviewFile extends Combine {
    constructor(homeUrl: string, paths: string[]) {
        paths = paths.filter((p) => !p.endsWith("file-overview.json"))
        const layer = new LayoutConfig(<any>mcChanges, true).layers[0]
        const filteredLayer = new FilteredLayer(layer)
        const filterPanel = new Combine([
            new Title("Filters"),
            new SvelteUIElement(Filterview, { filteredLayer }),
        ])

        const downloaded = new UIEventSource<{ features: ChangeSetData[] }[]>([])

        for (const filepath of paths) {
            if (filepath.endsWith("file-overview.json")) {
                continue
            }
            Utils.downloadJson(homeUrl + filepath).then((data) => {
                if (data === undefined) {
                    return
                }
                if (data.features === undefined) {
                    data.features = data
                }
                data?.features?.forEach((item) => {
                    item.properties = { ...item.properties, ...item.properties.metadata }
                    delete item.properties.metadata
                })
                downloaded.data.push(data)
                downloaded.ping()
            })
        }

        const loading = new Loading(
            new VariableUiElement(
                downloaded.map((dl) => "Downloaded " + dl.length + " items out of " + paths.length)
            )
        )

        super([
            filterPanel,
            new VariableUiElement(
                downloaded.map(
                    (downloaded) => {
                        if (downloaded.length !== paths.length) {
                            return loading
                        }

                        const overview = ChangesetsOverview.fromDirtyData(
                            [].concat(...downloaded.map((d) => d.features))
                        ).filter((cs) => filteredLayer.isShown(<any>cs.properties))
                        console.log("Overview is", overview)

                        if (overview._meta.length === 0) {
                            return "No data matched the filter"
                        }

                        const dateStrings = Utils.NoNull(
                            overview._meta.map((cs) => cs.properties.date)
                        )
                        const dates: number[] = dateStrings.map((d) => new Date(d).getTime())
                        const mindate = Math.min(...dates)
                        const maxdate = Math.max(...dates)

                        const diffInDays = (maxdate - mindate) / (1000 * 60 * 60 * 24)
                        console.log("Diff in days is ", diffInDays, "got", overview._meta.length)
                        const trs = layer.tagRenderings.filter(
                            (tr) => tr.mappings?.length > 0 || tr.freeform?.key !== undefined
                        )

                        const allKeys = new Set<string>()
                        for (const cs of overview._meta) {
                            for (const propertiesKey in cs.properties) {
                                allKeys.add(propertiesKey)
                            }
                        }
                        console.log("All keys:", allKeys)

                        const valuesToSum = [
                            "create",
                            "modify",
                            "delete",
                            "answer",
                            "move",
                            "deletion",
                            "add-image",
                            "plantnet-ai-detection",
                            "import",
                            "conflation",
                            "link-image",
                            "soft-delete",
                        ]

                        const allThemes = Utils.Dedup(overview._meta.map((f) => f.properties.theme))

                        const excludedThemes = new Set<string>()
                        if (allThemes.length > 1) {
                            excludedThemes.add("grb")
                            excludedThemes.add("etymology")
                        }
                        const summedValues = valuesToSum
                            .map((key) => [key, overview.sum(key, excludedThemes)])
                            .filter((kv) => kv[1] != 0)
                            .map((kv) => kv.join(": "))
                        const elements: BaseUIElement[] = [
                            new Title(
                                allThemes.length === 1
                                    ? "General statistics for " + allThemes[0]
                                    : "General statistics (excluding etymology- and GRB-theme changes)"
                            ),
                            new Combine([
                                overview._meta.length + " changesets match the filters",
                                new List(summedValues),
                            ]).SetClass("flex flex-col border rounded-xl"),

                            new Title("Breakdown"),
                        ]
                        for (const tr of trs) {
                            if (tr.question === undefined) {
                                continue
                            }
                            console.log(tr)
                            let total = undefined
                            if (tr.freeform?.key !== undefined) {
                                total = new Set(
                                    overview._meta.map((f) => f.properties[tr.freeform.key])
                                ).size
                            }

                            try {
                                elements.push(
                                    new Combine([
                                        new Title(tr.question ?? tr.id).SetClass("p-2"),
                                        total > 1 ? total + " unique value" : undefined,
                                        new Title("By number of changesets", 4).SetClass("p-2"),
                                        new StackedRenderingChart(tr, <any>overview._meta, {
                                            period: diffInDays <= 367 ? "day" : "month",
                                            groupToOtherCutoff:
                                                total > 50 ? 25 : total > 10 ? 3 : 0,
                                        }).SetStyle("width: 75%; height: 600px"),
                                        new TagRenderingChart(<any>overview._meta, tr, {
                                            groupToOtherCutoff:
                                                total > 50 ? 25 : total > 10 ? 3 : 0,
                                            chartType: "doughnut",
                                            chartclasses: "w-8 h-8",
                                            sort: true,
                                        }).SetStyle("width: 25rem"),
                                        new Title("By number of modifications", 4).SetClass("p-2"),
                                        new StackedRenderingChart(
                                            tr,
                                            <any>Utils.Clone(overview._meta),
                                            {
                                                period: diffInDays <= 367 ? "day" : "month",
                                                groupToOtherCutoff: total > 50 ? 10 : 0,
                                                sumFields: valuesToSum,
                                            }
                                        ).SetStyle("width: 100%; height: 600px"),
                                    ]).SetClass("block border-2 border-subtle p-2 m-2 rounded-xl")
                                )
                            } catch (e) {
                                console.log("Could not generate a chart", e)
                                elements.push(
                                    new FixedUiElement(
                                        "No relevant information for " + tr.question.txt
                                    )
                                )
                            }
                        }

                        elements.push(
                            new SubtleButton(undefined, "Download as csv").onClick(() => {
                                const data = GeoOperations.toCSV(overview._meta, {
                                    ignoreTags:
                                        /^((deletion:node)|(import:node)|(move:node)|(soft-delete:))/,
                                })
                                Utils.offerContentsAsDownloadableFile(data, "statistics.csv", {
                                    mimetype: "text/csv",
                                })
                            })
                        )

                        return new Combine(elements)
                    },
                    [filteredLayer.currentFilter]
                )
            ).SetClass("block w-full h-full"),
        ])
        this.SetClass("block w-full h-full")
    }
}

class StatisticsGUI extends VariableUiElement {
    private static readonly homeUrl =
        "https://raw.githubusercontent.com/pietervdvn/MapComplete-data/main/changeset-metadata/"
    private static readonly stats_files = "file-overview.json"

    constructor() {
        const index = UIEventSource.FromPromise(
            Utils.downloadJson(StatisticsGUI.homeUrl + StatisticsGUI.stats_files)
        )
        super(
            index.map((paths) => {
                if (paths === undefined) {
                    return new Loading("Loading overview...")
                }

                return new StatsticsForOverviewFile(StatisticsGUI.homeUrl, paths)
            })
        )
        this.SetClass("block w-full h-full")
    }
}

class ChangesetsOverview {
    private static readonly theme_remappings = {
        metamap: "maps",
        groen: "buurtnatuur",
        "updaten van metadata met mapcomplete": "buurtnatuur",
        "Toevoegen of dit natuurreservaat toegangkelijk is": "buurtnatuur",
        "wiki:mapcomplete/fritures": "fritures",
        "wiki:MapComplete/Fritures": "fritures",
        lits: "lit",
        pomp: "cyclofix",
        "wiki:user:joost_schouppe/campersite": "campersite",
        "wiki-user-joost_schouppe-geveltuintjes": "geveltuintjes",
        "wiki-user-joost_schouppe-campersite": "campersite",
        "wiki-User-joost_schouppe-campersite": "campersite",
        "wiki-User-joost_schouppe-geveltuintjes": "geveltuintjes",
        "wiki:User:joost_schouppe/campersite": "campersite",
        arbres: "arbres_llefia",
        aed_brugge: "aed",
        "https://llefia.org/arbres/mapcomplete.json": "arbres_llefia",
        "https://llefia.org/arbres/mapcomplete1.json": "arbres_llefia",
        "toevoegen of dit natuurreservaat toegangkelijk is": "buurtnatuur",
        "testing mapcomplete 0.0.0": "buurtnatuur",
        entrances: "indoor",
        "https://raw.githubusercontent.com/osmbe/play/master/mapcomplete/geveltuinen/geveltuinen.json":
            "geveltuintjes",
    }
    public readonly _meta: ChangeSetData[]

    private constructor(meta: ChangeSetData[]) {
        this._meta = Utils.NoNull(meta)
    }

    public static fromDirtyData(meta: ChangeSetData[]): ChangesetsOverview {
        return new ChangesetsOverview(meta?.map((cs) => ChangesetsOverview.cleanChangesetData(cs)))
    }

    private static cleanChangesetData(cs: ChangeSetData): ChangeSetData {
        if (cs === undefined) {
            return undefined
        }
        if (cs.properties.editor?.startsWith("iD")) {
            // We also fetch based on hashtag, so some edits with iD show up as well
            return undefined
        }
        if (cs.properties.theme === undefined) {
            cs.properties.theme = cs.properties.comment.substr(
                cs.properties.comment.lastIndexOf("#") + 1
            )
        }
        cs.properties.theme = cs.properties.theme.toLowerCase()
        const remapped = ChangesetsOverview.theme_remappings[cs.properties.theme]
        cs.properties.theme = remapped ?? cs.properties.theme
        if (cs.properties.theme.startsWith("https://raw.githubusercontent.com/")) {
            cs.properties.theme =
                "gh://" + cs.properties.theme.substr("https://raw.githubusercontent.com/".length)
        }
        if (cs.properties.modify + cs.properties.delete + cs.properties.create == 0) {
            cs.properties.theme = "EMPTY CS"
        }
        try {
            cs.properties.host = new URL(cs.properties.host).host
        } catch (e) {}
        return cs
    }

    public filter(predicate: (cs: ChangeSetData) => boolean) {
        return new ChangesetsOverview(this._meta.filter(predicate))
    }

    public sum(key: string, excludeThemes: Set<string>): number {
        let s = 0
        for (const feature of this._meta) {
            if (excludeThemes.has(feature.properties.theme)) {
                continue
            }
            const parsed = Number(feature.properties[key])
            if (!isNaN(parsed)) {
                s += parsed
            }
        }
        return s
    }
}

interface ChangeSetData extends Feature<Polygon> {
    id: number
    type: "Feature"
    geometry: {
        type: "Polygon"
        coordinates: [number, number][][]
    }
    properties: {
        check_user: null
        reasons: []
        tags: []
        features: []
        user: string
        uid: string
        editor: string
        comment: string
        comments_count: number
        source: string
        imagery_used: string
        date: string
        reviewed_features: []
        create: number
        modify: number
        delete: number
        area: number
        is_suspect: boolean
        harmful: any
        checked: boolean
        check_date: any
        host: string
        theme: string
        imagery: string
        language: string
    }
}

new StatisticsGUI().AttachTo("main")
