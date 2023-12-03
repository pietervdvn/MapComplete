import { Store, UIEventSource } from "../UIEventSource"
import { RasterLayerPolygon } from "../../Models/RasterLayers"

/**
 * Selects the appropriate raster layer as background for the given query parameter, theme setting, user preference or default value.
 *
 * It the requested layer is not available, a layer of the same type will be selected.
 */
export class PreferredRasterLayerSelector {
    private readonly _rasterLayerSetting: UIEventSource<RasterLayerPolygon>
    private readonly _availableLayers: Store<RasterLayerPolygon[]>
    private readonly _preferredBackgroundLayer: UIEventSource<
        string | "photo" | "map" | "osmbasedmap" | undefined
    >
    private readonly _queryParameter: UIEventSource<string>

    constructor(
        rasterLayerSetting: UIEventSource<RasterLayerPolygon>,
        availableLayers: Store<RasterLayerPolygon[]>,
        queryParameter: UIEventSource<string>,
        preferredBackgroundLayer: UIEventSource<
            string | "photo" | "map" | "osmbasedmap" | undefined
        >
    ) {
        this._rasterLayerSetting = rasterLayerSetting
        this._availableLayers = availableLayers
        this._queryParameter = queryParameter
        this._preferredBackgroundLayer = preferredBackgroundLayer
        const self = this

        this._rasterLayerSetting.addCallbackD((layer) => {
            if (layer.properties.id !== this._queryParameter.data) {
                this._queryParameter.setData(undefined)
                return true
            }
        })

        this._queryParameter.addCallbackAndRunD((_) => {
            const isApplied = self.updateLayer()
            if (!isApplied) {
                // A different layer was set as background
                // We remove this queryParameter instead
                self._queryParameter.setData(undefined)
                return true // Unregister
            }
        })

        this._preferredBackgroundLayer.addCallbackD((_) => self.updateLayer())

        this._availableLayers.addCallbackD((_) => self.updateLayer())
        self.updateLayer()
    }

    /**
     * Returns 'true' if the target layer is set or is the current layer
     * @private
     */
    private updateLayer() {
        // What is the ID of the layer we have to (try to) load?
        const targetLayerId = this._queryParameter.data ?? this._preferredBackgroundLayer.data
        const available = this._availableLayers.data
        const isCategory =
            targetLayerId === "photo" || targetLayerId === "osmbasedmap" || targetLayerId === "map"
        const foundLayer = isCategory
            ? available.find((l) => l.properties.category === targetLayerId)
            : available.find((l) => l.properties.id === targetLayerId)
        console.debug("Updating background layer to", foundLayer?.id, {
            targetLayerId,
            queryParam: this._queryParameter?.data,
            preferred: this._preferredBackgroundLayer?.data,
            isCategory,
        })
        if (foundLayer) {
            this._rasterLayerSetting.setData(foundLayer)
            return true
        }

        // The current layer is not in view
    }
}
