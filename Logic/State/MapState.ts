import { Store, UIEventSource } from "../UIEventSource"
import FilteredLayer from "../../Models/FilteredLayer"
import TilesourceConfig from "../../Models/ThemeConfig/TilesourceConfig"
import { QueryParameters } from "../Web/QueryParameters"
import ShowOverlayLayer from "../../UI/ShowDataLayer/ShowOverlayLayer"
import { FeatureSource, FeatureSourceForLayer, Tiled } from "../FeatureSource/FeatureSource"
import StaticFeatureSource, {
    TiledStaticFeatureSource,
} from "../FeatureSource/Sources/StaticFeatureSource"
import { Feature } from "geojson"
import { MapProperties } from "../../Models/MapProperties"

/**
 * Contains all the leaflet-map related state
 */
export default class MapState {
    /**
     * Last location where a click was registered
     */
    public readonly LastClickLocation: UIEventSource<{
        lat: number
        lon: number
    }> = new UIEventSource<{ lat: number; lon: number }>(undefined)

    /**
     * The bounds of the current map view
     */
    public currentView: FeatureSourceForLayer & Tiled

    /**
     * A builtin layer which contains the selected element.
     * Loads 'selected_element.json'
     * This _might_ contain multiple points, e.g. every center of a multipolygon
     */
    public selectedElementsLayer: FeatureSourceForLayer & Tiled

    /**
     * Which overlays are shown
     */
    public overlayToggles: { config: TilesourceConfig; isDisplayed: UIEventSource<boolean> }[]

    constructor() {
        this.availableBackgroundLayers = AvailableBaseLayers.AvailableLayersAt(this.locationControl)

        let defaultLayer = AvailableBaseLayers.osmCarto
        const available = this.availableBackgroundLayers.data
        for (const layer of available) {
            if (this.backgroundLayerId.data === layer.id) {
                defaultLayer = layer
            }
        }
        const self = this
        this.backgroundLayer = new UIEventSource<BaseLayer>(defaultLayer)
        this.backgroundLayer.addCallbackAndRunD((layer) => self.backgroundLayerId.setData(layer.id))

        this.overlayToggles =
            this.layoutToUse?.tileLayerSources
                ?.filter((c) => c.name !== undefined)
                ?.map((c) => ({
                    config: c,
                    isDisplayed: QueryParameters.GetBooleanQueryParameter(
                        "overlay-" + c.id,
                        c.defaultState,
                        "Wether or not the overlay " + c.id + " is shown"
                    ),
                })) ?? []

        this.AddAllOverlaysToMap(this.leafletMap)

        this.initCurrentView()
        this.initSelectedElement()
    }

    public AddAllOverlaysToMap(leafletMap: UIEventSource<any>) {
        const initialized = new Set()
        for (const overlayToggle of this.overlayToggles) {
            new ShowOverlayLayer(overlayToggle.config, leafletMap, overlayToggle.isDisplayed)
            initialized.add(overlayToggle.config)
        }

        for (const tileLayerSource of this.layoutToUse?.tileLayerSources ?? []) {
            if (initialized.has(tileLayerSource)) {
                continue
            }
            new ShowOverlayLayer(tileLayerSource, leafletMap)
        }
    }

    private static initCurrentView(mapproperties: MapProperties): FeatureSource {
        let i = 0
        const features: Store<Feature[]> = mapproperties.bounds.map((bounds) => {
            if (bounds === undefined) {
                return []
            }
            i++
            return [
                bounds.asGeoJson({
                    id: "current_view-" + i,
                    current_view: "yes",
                    zoom: "" + mapproperties.zoom.data,
                }),
            ]
        })

        return new StaticFeatureSource(features)
    }

    private initSelectedElement() {
        const layerDef: FilteredLayer = this.filteredLayers.data.filter(
            (l) => l.layerDef.id === "selected_element"
        )[0]
        const empty = []
        const store = this.selectedElement.map((feature) => {
            if (feature === undefined || feature === null) {
                return empty
            }
            return [
                {
                    feature: {
                        type: "Feature",
                        properties: {
                            selected: "yes",
                            id: "selected" + feature.properties.id,
                        },
                        geometry: feature.geometry,
                    },
                    freshness: new Date(),
                },
            ]
        })
        this.selectedElementsLayer = new TiledStaticFeatureSource(store, layerDef)
    }
}
