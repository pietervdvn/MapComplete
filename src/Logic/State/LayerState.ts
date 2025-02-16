import { Store, UIEventSource } from "../UIEventSource"
import { GlobalFilter } from "../../Models/GlobalFilter"
import FilteredLayer from "../../Models/FilteredLayer"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import { OsmConnection } from "../Osm/OsmConnection"
import { Tag } from "../Tags/Tag"
import Translations from "../../UI/i18n/Translations"
import { RegexTag } from "../Tags/RegexTag"
import { Or } from "../Tags/Or"
import FilterConfig from "../../Models/ThemeConfig/FilterConfig"

export type ActiveFilter = {
    layer: LayerConfig
    filter: FilterConfig
    control: UIEventSource<string | number | undefined>
}
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
    private readonly _activeFilters: UIEventSource<ActiveFilter[]> = new UIEventSource([])

    public readonly activeFilters: Store<ActiveFilter[]> = this._activeFilters
    private readonly _activeLayers: UIEventSource<FilteredLayer[]> = new UIEventSource<
        FilteredLayer[]
    >(undefined)
    public readonly activeLayers: Store<FilteredLayer[]> = this._activeLayers
    private readonly _nonactiveLayers: UIEventSource<FilteredLayer[]> = new UIEventSource<
        FilteredLayer[]
    >(undefined)
    public readonly nonactiveLayers: Store<FilteredLayer[]> = this._nonactiveLayers
    private readonly osmConnection: OsmConnection

    /**
     *
     * @param osmConnection
     * @param layers
     * @param context
     * @param layersEnabledByDefault
     */
    constructor(
        osmConnection: OsmConnection,
        layers: LayerConfig[],
        context: string,
        layersEnabledByDefault: Store<boolean>
    ) {
        this.osmConnection = osmConnection
        const filteredLayers = new Map()
        for (const layer of layers) {
            filteredLayers.set(
                layer.id,
                FilteredLayer.initLinkedState(
                    layer,
                    context,
                    this.osmConnection,
                    layersEnabledByDefault
                )
            )
        }
        this.filteredLayers = filteredLayers
        layers.forEach((l) => LayerState.linkFilterStates(l, filteredLayers))

        this.filteredLayers.forEach((fl) => {
            fl.isDisplayed.addCallback(() => this.updateActiveFilters())
            for (const [_, appliedFilter] of fl.appliedFilters) {
                appliedFilter.addCallback(() => this.updateActiveFilters())
            }
        })
        this.updateActiveFilters()
    }

    private updateActiveFilters() {
        const filters: ActiveFilter[] = []
        const activeLayers: FilteredLayer[] = []
        const nonactiveLayers: FilteredLayer[] = []
        this.filteredLayers.forEach((fl) => {
            if (!fl.isDisplayed.data) {
                nonactiveLayers.push(fl)
                return
            }
            activeLayers.push(fl)

            if (fl.layerDef.filterIsSameAs) {
                return
            }
            for (const [filtername, appliedFilter] of fl.appliedFilters) {
                if (appliedFilter.data === undefined) {
                    continue
                }
                const filter = fl.layerDef.filters.find((f) => f.id === filtername)
                if (typeof appliedFilter.data === "number") {
                    if (filter.options[appliedFilter.data].osmTags === undefined) {
                        // This is probably the first, generic option which doesn't _actually_ filter
                        continue
                    }
                }
                filters.push({
                    layer: fl.layerDef,
                    control: appliedFilter,
                    filter,
                })
            }
        })
        this._activeLayers.set(activeLayers)
        this._nonactiveLayers.set(nonactiveLayers)
        this._activeFilters.set(filters)
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
        // We make a shallow copy, reusing the same underlying stores
        const copy = new FilteredLayer(layer, toReuse.appliedFilters, toReuse.isDisplayed)
        filteredLayers.set(layer.id, copy)
    }
}
