import { UIEventSource } from "../Logic/UIEventSource"
import LayerConfig from "./ThemeConfig/LayerConfig"
import { OsmConnection } from "../Logic/Osm/OsmConnection"
import { LocalStorageSource } from "../Logic/Web/LocalStorageSource"
import { QueryParameters } from "../Logic/Web/QueryParameters"

export default class FilteredLayer {
    /**
     * Wether or not the specified layer is shown
     */
    readonly isDisplayed: UIEventSource<boolean>
    /**
     * Maps the filter.option.id onto the actual used state
     */
    readonly appliedFilters: Map<string, UIEventSource<undefined | number | string>>
    readonly layerDef: LayerConfig

    constructor(
        layer: LayerConfig,
        appliedFilters?: Map<string, UIEventSource<undefined | number | string>>,
        isDisplayed?: UIEventSource<boolean>
    ) {
        this.layerDef = layer
        this.isDisplayed = isDisplayed ?? new UIEventSource(true)
        this.appliedFilters =
            appliedFilters ?? new Map<string, UIEventSource<number | string | undefined>>()
    }

    /**
     * Creates a FilteredLayer which is tied into the QueryParameters and/or user preferences
     */
    public static initLinkedState(
        layer: LayerConfig,
        context: string,
        osmConnection: OsmConnection
    ) {
        let isDisplayed: UIEventSource<boolean>
        if (layer.syncSelection === "local") {
            isDisplayed = LocalStorageSource.GetParsed(
                context + "-layer-" + layer.id + "-enabled",
                layer.shownByDefault
            )
        } else if (layer.syncSelection === "theme-only") {
            isDisplayed = FilteredLayer.getPref(
                osmConnection,
                context + "-layer-" + layer.id + "-enabled",
                layer
            )
        } else if (layer.syncSelection === "global") {
            isDisplayed = FilteredLayer.getPref(
                osmConnection,
                "layer-" + layer.id + "-enabled",
                layer
            )
        } else {
            isDisplayed = QueryParameters.GetBooleanQueryParameter(
                "layer-" + layer.id,
                layer.shownByDefault,
                "Whether or not layer " + layer.id + " is shown"
            )
        }

        const appliedFilters = new Map<string, UIEventSource<undefined | number | string>>()
        for (const subfilter of layer.filters) {
            appliedFilters.set(subfilter.id, subfilter.initState())
        }
        return new FilteredLayer(layer, appliedFilters, isDisplayed)
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
}
