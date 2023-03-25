import { UIEventSource } from "../UIEventSource"
import { GlobalFilter } from "../../Models/GlobalFilter"
import FilteredLayer, { FilterState } from "../../Models/FilteredLayer"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import { OsmConnection } from "../Osm/OsmConnection"
import { LocalStorageSource } from "../Web/LocalStorageSource"
import { QueryParameters } from "../Web/QueryParameters"

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
    public readonly filteredLayers: Map<string, FilteredLayer>
    private readonly osmConnection: OsmConnection

    /**
     *
     * @param osmConnection
     * @param layers
     * @param context: the context, probably the name of the theme. Used to disambiguate the upstream user preference
     */
    constructor(osmConnection: OsmConnection, layers: LayerConfig[], context: string) {
        this.osmConnection = osmConnection
        this.filteredLayers = new Map()
        for (const layer of layers) {
            this.filteredLayers.set(layer.id, this.initFilteredLayer(layer, context))
        }
        layers.forEach((l) => this.linkFilterStates(l))
    }

    private static getPref(
        osmConnection: OsmConnection,
        key: string,
        layer: LayerConfig
    ): UIEventSource<boolean> {
        return osmConnection.GetPreference(key, layer.shownByDefault + "").sync(
            (v) => {
                if (v === undefined) {
                    return undefined
                }
                return v === "true"
            },
            [],
            (b) => {
                if (b === undefined) {
                    return undefined
                }
                return "" + b
            }
        )
    }
    /**
     * INitializes a filtered layer for the given layer.
     * @param layer
     * @param context: probably the theme-name. This is used to disambiguate the user settings; e.g. when using the same layer in different contexts
     * @private
     */
    private initFilteredLayer(layer: LayerConfig, context: string): FilteredLayer | undefined {
        let isDisplayed: UIEventSource<boolean>
        const osmConnection = this.osmConnection
        if (layer.syncSelection === "local") {
            isDisplayed = LocalStorageSource.GetParsed(
                context + "-layer-" + layer.id + "-enabled",
                layer.shownByDefault
            )
        } else if (layer.syncSelection === "theme-only") {
            isDisplayed = LayerState.getPref(
                osmConnection,
                context + "-layer-" + layer.id + "-enabled",
                layer
            )
        } else if (layer.syncSelection === "global") {
            isDisplayed = LayerState.getPref(osmConnection, "layer-" + layer.id + "-enabled", layer)
        } else {
            isDisplayed = QueryParameters.GetBooleanQueryParameter(
                "layer-" + layer.id,
                layer.shownByDefault,
                "Wether or not layer " + layer.id + " is shown"
            )
        }

        const flayer: FilteredLayer = {
            isDisplayed,
            layerDef: layer,
            appliedFilters: new UIEventSource<Map<string, FilterState>>(
                new Map<string, FilterState>()
            ),
        }
        layer.filters?.forEach((filterConfig) => {
            const stateSrc = filterConfig.initState()

            stateSrc.addCallbackAndRun((state) =>
                flayer.appliedFilters.data.set(filterConfig.id, state)
            )
            flayer.appliedFilters
                .map((dict) => dict.get(filterConfig.id))
                .addCallback((state) => stateSrc.setData(state))
        })

        return flayer
    }

    /**
     * Some layers copy the filter state of another layer - this is quite often the case for 'sibling'-layers,
     * (where two variations of the same layer are used, e.g. a specific type of shop on all zoom levels and all shops on high zoom).
     *
     * This methods links those states for the given layer
     */
    private linkFilterStates(layer: LayerConfig) {
        if (layer.filterIsSameAs === undefined) {
            return
        }
        const toReuse = this.filteredLayers.get(layer.filterIsSameAs)
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
        this.filteredLayers.set(layer.id, {
            isDisplayed: toReuse.isDisplayed,
            layerDef: layer,
            appliedFilters: toReuse.appliedFilters,
        })
    }
}
