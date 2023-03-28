import { UIEventSource } from "../UIEventSource"
import { GlobalFilter } from "../../Models/GlobalFilter"
import FilteredLayer from "../../Models/FilteredLayer"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import { OsmConnection } from "../Osm/OsmConnection"

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
            this.filteredLayers.set(
                layer.id,
                FilteredLayer.initLinkedState(layer, context, this.osmConnection)
            )
        }
        layers.forEach((l) => this.linkFilterStates(l))
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
        this.filteredLayers.set(layer.id, toReuse)
    }
}
