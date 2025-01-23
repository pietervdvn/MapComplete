import { BBox } from "../BBox"
import { Store } from "../UIEventSource"
import Constants from "../../Models/Constants"
import { WithChangesState } from "../../Models/ThemeViewState/WithChangesState"

export type FeatureViewState =
    | "no-data"
    | "zoom-to-low"
    | "has-visible-feature"
    | "all-filtered-away"
export default class NoElementsInViewDetector {
    public readonly hasFeatureInView: Store<FeatureViewState>

    constructor(themeViewState: WithChangesState) {
        const state = themeViewState
        const minZoom = Math.min(
            ...themeViewState.theme.layers
                .filter((l) => Constants.priviliged_layers.indexOf(<any>l.id) < 0)
                .map((l) => l.minzoom)
        )
        const mapProperties = themeViewState.mapProperties

        const priviliged: Set<string> = new Set(Constants.priviliged_layers)

        this.hasFeatureInView = state.mapProperties.bounds.stabilized(100).map(
            (bbox) => {
                if (!bbox) {
                    return undefined
                }
                if (mapProperties.zoom.data < minZoom) {
                    // Not a single layer will display anything as the zoom is to low
                    return "zoom-to-low"
                }


                for (const [layerName, source] of themeViewState.perLayerFiltered) {
                    if (priviliged.has(layerName)) {
                        continue
                    }
                    const feats = source.features.data
                    if (!(feats?.length > 0)) {
                        // Nope, no data loaded
                        continue
                    }
                    const layer = themeViewState.theme.getLayer(layerName)
                    if (mapProperties.zoom.data < layer.minzoom) {
                        continue
                    }
                    if (!state.layerState.filteredLayers.get(layerName).isDisplayed.data) {
                        continue
                    }

                    for (const feat of feats) {
                        if (BBox.get(feat).overlapsWith(bbox)) {
                            // We found at least one item which has visible data
                            return "has-visible-feature"
                        }
                    }
                }

                // If we arrive here, data might have been filtered away

                for (const [layerName, source] of themeViewState.perLayerFiltered) {
                    if (priviliged.has(layerName)) {
                        continue
                    }

                    const layer = themeViewState.theme.getLayer(layerName)
                    if (mapProperties.zoom.data < layer.minzoom) {
                        continue
                    }
                    const feats = source.features.data
                    if (!(feats?.length > 0)) {
                        // Nope, no data loaded
                        continue
                    }

                    for (const feat of feats) {
                        if (BBox.get(feat).overlapsWith(bbox)) {
                            // We found at least one item, but as we didn't find it before, it is filtered away
                            return "all-filtered-away"
                        }
                    }
                }
                return "no-data"
            },
            [
                ...Array.from(themeViewState.perLayerFiltered.values()).map((f) => f.features),
                mapProperties.zoom,
                ...Array.from(state.layerState.filteredLayers.values()).map((fl) => fl.isDisplayed),
            ]
        )
    }
}
