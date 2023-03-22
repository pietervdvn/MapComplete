import { ImmutableStore, Store } from "../../Logic/UIEventSource"
import type { Map as MlMap } from "maplibre-gl"
import { Marker } from "maplibre-gl"
import { ShowDataLayerOptions } from "../ShowDataLayer/ShowDataLayerOptions"
import { GeoOperations } from "../../Logic/GeoOperations"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import PointRenderingConfig from "../../Models/ThemeConfig/PointRenderingConfig"
import { OsmFeature, OsmTags } from "../../Models/OsmFeature"
import FeatureSource from "../../Logic/FeatureSource/FeatureSource"
import { BBox } from "../../Logic/BBox"

class PointRenderingLayer {
    private readonly _config: PointRenderingConfig
    private readonly _fetchStore?: (id: string) => Store<OsmTags>
    private readonly _map: MlMap

    constructor(
        map: MlMap,
        features: FeatureSource,
        config: PointRenderingConfig,
        fetchStore?: (id: string) => Store<OsmTags>
    ) {
        this._config = config
        this._map = map
        this._fetchStore = fetchStore
        const cache: Map<string, Marker> = new Map<string, Marker>()
        const self = this
        features.features.addCallbackAndRunD((features) => {
            const unseenKeys = new Set(cache.keys())
            for (const { feature } of features) {
                const id = feature.properties.id
                unseenKeys.delete(id)
                const loc = GeoOperations.centerpointCoordinates(feature)
                if (cache.has(id)) {
                    console.log("Not creating a marker for ", id)
                    const cached = cache.get(id)
                    const oldLoc = cached.getLngLat()
                    console.log("OldLoc vs newLoc", oldLoc, loc)
                    if (loc[0] !== oldLoc.lng && loc[1] !== oldLoc.lat) {
                        cached.setLngLat(loc)
                        console.log("MOVED")
                    }
                    continue
                }

                console.log("Creating a marker for ", id)
                const marker = self.addPoint(feature)
                cache.set(id, marker)
            }

            for (const unseenKey of unseenKeys) {
                cache.get(unseenKey).remove()
                cache.delete(unseenKey)
            }
        })
    }

    private addPoint(feature: OsmFeature): Marker {
        let store: Store<OsmTags>
        if (this._fetchStore) {
            store = this._fetchStore(feature.properties.id)
        } else {
            store = new ImmutableStore(feature.properties)
        }
        const { html, iconAnchor } = this._config.GenerateLeafletStyle(store, true)
        html.SetClass("marker")
        const el = html.ConstructElement()

        el.addEventListener("click", function () {
            window.alert("Hello world!")
        })

        return new Marker(el)
            .setLngLat(GeoOperations.centerpointCoordinates(feature))
            .setOffset(iconAnchor)
            .addTo(this._map)
    }
}

export class ShowDataLayer {
    private readonly _map: Store<MlMap>
    private _options: ShowDataLayerOptions & { layer: LayerConfig }

    constructor(map: Store<MlMap>, options: ShowDataLayerOptions & { layer: LayerConfig }) {
        this._map = map
        this._options = options
        const self = this
        map.addCallbackAndRunD((map) => self.initDrawFeatures(map))
    }

    private initDrawFeatures(map: MlMap) {
        for (const pointRenderingConfig of this._options.layer.mapRendering) {
            new PointRenderingLayer(
                map,
                this._options.features,
                pointRenderingConfig,
                this._options.fetchStore
            )
        }
        if (this._options.zoomToFeatures) {
            const features = this._options.features.features.data
            const bbox = BBox.bboxAroundAll(features.map((f) => BBox.get(f.feature)))
            map.fitBounds(bbox.toLngLat(), {
                padding: { top: 10, bottom: 10, left: 10, right: 10 },
            })
        }
    }
}
