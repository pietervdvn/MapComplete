import { FeatureSource } from "../../Logic/FeatureSource/FeatureSource"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import { Feature } from "geojson"

export interface ShowDataLayerOptions {
    /**
     * Features to show
     */
    features: FeatureSource
    /**
     * Indication of the current selected element; overrides some filters.
     * When a feature is tapped, the feature will be put in there
     */
    selectedElement?: UIEventSource<Feature>

    /**
     * If set, zoom to the features when initially loaded and when they are changed
     */
    zoomToFeatures?: false | boolean
    /**
     * Toggles the layer on/off
     */
    doShowLayer?: Store<true | boolean>

    /**
     * Function which fetches the relevant store.
     * If given, the map will update when a property is changed
     */
    fetchStore?: (id: string) => Store<Record<string, string>>

    onClick?: (feature: Feature) => void
    metaTags?: Store<Record<string, string>>
}
