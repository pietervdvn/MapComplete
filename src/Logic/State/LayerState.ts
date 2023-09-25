import { UIEventSource } from "../UIEventSource"
import { GlobalFilter } from "../../Models/GlobalFilter"
import FilteredLayer from "../../Models/FilteredLayer"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import { OsmConnection } from "../Osm/OsmConnection"
import { Tag } from "../Tags/Tag"
import Translations from "../../UI/i18n/Translations"
import { RegexTag } from "../Tags/RegexTag"
import { Or } from "../Tags/Or"

/**
 * The layer state keeps track of:
 * - Which layers are enabled
 * - Which filters are used, including 'global' filters
 */
export default class LayerState {
    /**
     * Filters which apply onto all layers
     */
    public readonly globalFilters: UIEventSource<GlobalFilter[]> = new UIEventSource(
        [],
        "globalFilters"
    )

    /**
     * Which layers are enabled in the current theme and what filters are applied onto them
     */
    public readonly filteredLayers: ReadonlyMap<string, FilteredLayer>
    private readonly osmConnection: OsmConnection

    /**
     *
     * @param osmConnection
     * @param layers
     * @param context: the context, probably the name of the theme. Used to disambiguate the upstream user preference
     */
    constructor(osmConnection: OsmConnection, layers: LayerConfig[], context: string) {
        this.osmConnection = osmConnection
        const filteredLayers = new Map()
        for (const layer of layers) {
            filteredLayers.set(
                layer.id,
                FilteredLayer.initLinkedState(layer, context, this.osmConnection)
            )
        }
        this.filteredLayers = filteredLayers
        layers.forEach((l) => LayerState.linkFilterStates(l, filteredLayers))
    }

    /**
     * Sets the global filter which looks to the 'level'-tag.
     * Only features with the given 'level' will be shown.
     *
     * If undefined is passed, _all_ levels will be shown
     * @param level
     */
    public setLevelFilter(level?: string) {
        // Remove all previous
        const l = this.globalFilters.data.length
        this.globalFilters.data = this.globalFilters.data.filter((f) => f.id !== "level")
        if (!level) {
            if (l !== this.globalFilters.data.length) {
                this.globalFilters.ping()
            }
            return
        }
        const t = Translations.t.general.levelSelection
        const conditionsOrred = [
            new Tag("_level", "" + level),
            new RegexTag("_level", new RegExp("(.*;)?" + level + "(;.*)?")),
        ]
        if (level === "0") {
            conditionsOrred.push(new Tag("_level", "")) // No level tag is the same as level '0'
        }
        console.log("Setting levels filter to", conditionsOrred)
        this.globalFilters.data.push({
            id: "level",
            state: level,
            osmTags: new Or(conditionsOrred),
            onNewPoint: {
                tags: [new Tag("level", level)],
                icon: "./assets/svg/elevator.svg",
                confirmAddNew: t.confirmLevel.PartialSubs({ level }),
                safetyCheck: t.addNewOnLevel.Subs({ level }),
            },
        })
        this.globalFilters.ping()
    }

    /**
     * Some layers copy the filter state of another layer - this is quite often the case for 'sibling'-layers,
     * (where two variations of the same layer are used, e.g. a specific type of shop on all zoom levels and all shops on high zoom).
     *
     * This methods links those states for the given layer
     */
    private static linkFilterStates(
        layer: LayerConfig,
        filteredLayers: Map<string, FilteredLayer>
    ) {
        if (layer.filterIsSameAs === undefined) {
            return
        }
        const toReuse = filteredLayers.get(layer.filterIsSameAs)
        if (toReuse === undefined) {
            throw (
                "Error in layer " +
                layer.id +
                ": it defines that it should be use the filters of " +
                layer.filterIsSameAs +
                ", but this layer was not loaded"
            )
        }
        console.warn(
            "Linking filter and isDisplayed-states of " + layer.id + " and " + layer.filterIsSameAs
        )
        const copy = new FilteredLayer(layer, toReuse.appliedFilters, toReuse.isDisplayed)
        filteredLayers.set(layer.id, copy)
    }
}
