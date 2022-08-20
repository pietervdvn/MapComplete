/**
 * The statistics-gui shows statistics from previous MapComplete-edits
 */
import {UIEventSource} from "../Logic/UIEventSource";
import {VariableUiElement} from "./Base/VariableUIElement";
import Loading from "./Base/Loading";
import {Utils} from "../Utils";
import Combine from "./Base/Combine";
import BaseUIElement from "./BaseUIElement";
import TagRenderingChart, {StackedRenderingChart} from "./BigComponents/TagRenderingChart";
import TagRenderingConfig from "../Models/ThemeConfig/TagRenderingConfig";
import FilterView, {LayerFilterPanel} from "./BigComponents/FilterView";
import FilteredLayer, {FilterState} from "../Models/FilteredLayer";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";

export default class StatisticsGUI {

    private static readonly homeUrl = "https://raw.githubusercontent.com/pietervdvn/MapComplete/develop/Docs/Tools/stats/"
    private static readonly stats_files = "file-overview.json"
    private readonly index = UIEventSource.FromPromise(Utils.downloadJson(StatisticsGUI.homeUrl + StatisticsGUI.stats_files))


    public setup(): void {

        const appliedFilters = new UIEventSource<Map<string, FilterState>>(new Map<string, FilterState>())
        const layer = AllKnownLayouts.allKnownLayouts.get("mapcomplete-changes").layers[0]

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
                    let overview = ChangesetsOverview.fromDirtyData([].concat(...downloaded.map(d => d.features)))
                    //  return overview.breakdownPerDay(overview.themeBreakdown)

                    if (appliedFilters.data.size > 0) {
                        appliedFilters.data.forEach((filterSpec) => {
                            const tf = filterSpec?.currentFilter
                            if (tf === undefined) {
                                return
                            }
                            overview = overview.filter(cs => tf.matchesProperties(cs.properties))
                        })
                    }

                    if (downloaded.length === 0) {
                        return "No data matched the filter"
                    }
                    return new Combine(layer.tagRenderings.map(tr => {

                            try {

                                return new StackedRenderingChart(tr, <any>overview._meta, "month")
                            } catch (e) {
                                return "Could not create stats for " + tr.id
                            }
                        })
                    )
                }, [appliedFilters])).SetClass("block w-full h-full")
            ]).SetClass("block w-full h-full")


        })).SetClass("block w-full h-full").AttachTo("maindiv")

        const filteredLayer = <FilteredLayer>{
            appliedFilters,
            layerDef: layer,
            isDisplayed: new UIEventSource<boolean>(true)
        }
        new LayerFilterPanel(undefined, filteredLayer).AttachTo("extradiv")

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
    public readonly _meta: ChangeSetData[];

    public static fromDirtyData(meta: ChangeSetData[]) {
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
