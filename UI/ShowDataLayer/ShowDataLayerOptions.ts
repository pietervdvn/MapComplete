import FeatureSource from "../../Logic/FeatureSource/FeatureSource"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { ElementStorage } from "../../Logic/ElementStorage"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import ScrollableFullScreen from "../Base/ScrollableFullScreen"
import { OsmTags } from "../../Models/OsmFeature"

export interface ShowDataLayerOptions {
    /**
     * Features to show
     */
    features: FeatureSource
    /**
     * Indication of the current selected element; overrides some filters
     */
    selectedElement?: UIEventSource<any>
    /**
     * What popup to build when a feature is selected
     */
    buildPopup?:
        | undefined
        | ((tags: UIEventSource<any>, layer: LayerConfig) => ScrollableFullScreen)

    /**
     * If set, zoom to the features when initially loaded and when they are changed
     */
    zoomToFeatures?: false | boolean
    /**
     * Toggles the layer on/off
     */
    doShowLayer?: Store<true | boolean>

    /**
     * Function which fetches the relevant store
     */
    fetchStore?: (id: string) => Store<OsmTags>
}
