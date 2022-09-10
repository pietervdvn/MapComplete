import BaseLayer from "../../Models/BaseLayer"
import { ImmutableStore, Store, UIEventSource } from "../UIEventSource"
import Loc from "../../Models/Loc"

export interface AvailableBaseLayersObj {
    readonly osmCarto: BaseLayer
    layerOverview: BaseLayer[]

    AvailableLayersAt(location: Store<Loc>): Store<BaseLayer[]>

    SelectBestLayerAccordingTo(
        location: Store<Loc>,
        preferedCategory: Store<string | string[]>
    ): Store<BaseLayer>
}

/**
 * Calculates which layers are available at the current location
 * Changes the basemap
 */
export default class AvailableBaseLayers {
    public static layerOverview: BaseLayer[]
    public static osmCarto: BaseLayer

    private static implementation: AvailableBaseLayersObj

    static AvailableLayersAt(location: Store<Loc>): Store<BaseLayer[]> {
        return (
            AvailableBaseLayers.implementation?.AvailableLayersAt(location) ??
            new ImmutableStore<BaseLayer[]>([])
        )
    }

    static SelectBestLayerAccordingTo(
        location: Store<Loc>,
        preferedCategory: UIEventSource<string | string[]>
    ): Store<BaseLayer> {
        return (
            AvailableBaseLayers.implementation?.SelectBestLayerAccordingTo(
                location,
                preferedCategory
            ) ?? new ImmutableStore<BaseLayer>(undefined)
        )
    }

    public static implement(backend: AvailableBaseLayersObj) {
        AvailableBaseLayers.layerOverview = backend.layerOverview
        AvailableBaseLayers.osmCarto = backend.osmCarto
        AvailableBaseLayers.implementation = backend
    }
}
