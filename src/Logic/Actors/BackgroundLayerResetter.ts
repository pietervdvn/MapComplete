import { Store, UIEventSource } from "../UIEventSource"
import { Utils } from "../../Utils"
import { RasterLayerPolygon, RasterLayerUtils } from "../../Models/RasterLayers"

/**
 * When a user pans around on the map, they might pan out of the range of the current background raster layer.
 * This actor will then quickly select a (best) raster layer of the same category which is available
 */
export default class BackgroundLayerResetter {
    constructor(
        currentBackgroundLayer: UIEventSource<RasterLayerPolygon | undefined>,
        availableLayers: Store<RasterLayerPolygon[]>
    ) {
        if (Utils.runningFromConsole) {
            return
        }

        // Change the baseLayer back to OSM if we go out of the current range of the layer
        availableLayers.addCallbackAndRunD((availableLayers) => {
            // We only check on move/on change of the availableLayers
            const currentBgPolygon: RasterLayerPolygon | undefined = currentBackgroundLayer.data
            if (currentBackgroundLayer === undefined) {
                return
            }

            if (availableLayers.findIndex((available) => currentBgPolygon == available) >= 0) {
                // Still available!
                return
            }

            console.log("Current layer properties:", currentBgPolygon)
            // Oops, we panned out of range for this layer!
            // What is the 'best' map of the same category which is available?
            const availableInSameCat = RasterLayerUtils.SelectBestLayerAccordingTo(
                availableLayers,
                currentBgPolygon?.properties?.category
            )
            if (!availableInSameCat) {
                return
            }
            console.log("Selecting a different layer:", availableInSameCat.properties.id)
            currentBackgroundLayer.setData(availableInSameCat)
        })
    }
}
