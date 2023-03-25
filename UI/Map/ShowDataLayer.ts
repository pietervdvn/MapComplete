import { ImmutableStore, Store } from "../../Logic/UIEventSource"
import type { Map as MlMap } from "maplibre-gl"
import { Marker } from "maplibre-gl"
import { ShowDataLayerOptions } from "./ShowDataLayerOptions"
import { GeoOperations } from "../../Logic/GeoOperations"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import PointRenderingConfig from "../../Models/ThemeConfig/PointRenderingConfig"
import { OsmTags } from "../../Models/OsmFeature"
import FeatureSource from "../../Logic/FeatureSource/FeatureSource"
import { BBox } from "../../Logic/BBox"
import { Feature } from "geojson"
import ScrollableFullScreen from "../Base/ScrollableFullScreen"
import LineRenderingConfig from "../../Models/ThemeConfig/LineRenderingConfig"
import { Utils } from "../../Utils"
import * as range_layer from "../../assets/layers/range/range.json"
import { LayerConfigJson } from "../../Models/ThemeConfig/Json/LayerConfigJson"

class PointRenderingLayer {
    private readonly _config: PointRenderingConfig
    private readonly _fetchStore?: (id: string) => Store<OsmTags>
    private readonly _map: MlMap
    private readonly _onClick: (id: string) => void
    private readonly _allMarkers: Map<string, Marker> = new Map<string, Marker>()

    constructor(
        map: MlMap,
        features: FeatureSource,
        config: PointRenderingConfig,
        visibility?: Store<boolean>,
        fetchStore?: (id: string) => Store<OsmTags>,
        onClick?: (id: string) => void
    ) {
        this._config = config
        this._map = map
        this._fetchStore = fetchStore
        this._onClick = onClick
        const self = this

        features.features.addCallbackAndRunD((features) => self.updateFeatures(features))
        visibility?.addCallbackAndRunD((visible) => self.setVisibility(visible))
    }

    private updateFeatures(features: Feature[]) {
        const cache = this._allMarkers
        const unseenKeys = new Set(cache.keys())
        for (const location of this._config.location) {
            for (const feature of features) {
                if (feature?.geometry === undefined) {
                    console.warn(
                        "Got an invalid feature:",
                        features,
                        " while rendering",
                        location,
                        "of",
                        this._config
                    )
                }
                const loc = GeoOperations.featureToCoordinateWithRenderingType(
                    <any>feature,
                    location
                )
                if (loc === undefined) {
                    continue
                }
                const id = feature.properties.id + "-" + location
                unseenKeys.delete(id)

                if (cache.has(id)) {
                    const cached = cache.get(id)
                    const oldLoc = cached.getLngLat()
                    if (loc[0] !== oldLoc.lng && loc[1] !== oldLoc.lat) {
                        cached.setLngLat(loc)
                    }
                    continue
                }

                const marker = this.addPoint(feature, loc)
                cache.set(id, marker)
            }
        }

        for (const unseenKey of unseenKeys) {
            cache.get(unseenKey).remove()
            cache.delete(unseenKey)
        }
    }

    private setVisibility(visible: boolean) {
        for (const marker of this._allMarkers.values()) {
            if (visible) {
                marker.getElement().classList.remove("hidden")
            } else {
                marker.getElement().classList.add("hidden")
            }
        }
    }

    private addPoint(feature: Feature, loc: [number, number]): Marker {
        let store: Store<OsmTags>
        if (this._fetchStore) {
            store = this._fetchStore(feature.properties.id)
        } else {
            store = new ImmutableStore(<OsmTags>feature.properties)
        }
        const { html, iconAnchor } = this._config.RenderIcon(store, true)
        html.SetClass("marker")
        const el = html.ConstructElement()

        if (this._onClick) {
            const self = this
            el.addEventListener("click", function () {
                self._onClick(feature.properties.id)
            })
        }

        const marker = new Marker(el).setLngLat(loc).setOffset(iconAnchor).addTo(this._map)
        store
            .map((tags) => this._config.pitchAlignment.GetRenderValue(tags).Subs(tags).txt)
            .addCallbackAndRun((pitchAligment) => marker.setPitchAlignment(pitchAligment))
        store
            .map((tags) => this._config.rotationAlignment.GetRenderValue(tags).Subs(tags).txt)
            .addCallbackAndRun((pitchAligment) => marker.setRotationAlignment(pitchAligment))
        return marker
    }
}

class LineRenderingLayer {
    /**
     * These are dynamic properties
     * @private
     */
    private static readonly lineConfigKeys = [
        "color",
        "width",
        "lineCap",
        "offset",
        "fill",
        "fillColor",
    ] as const

    private static readonly lineConfigKeysColor = ["color", "fillColor"] as const
    private static readonly lineConfigKeysNumber = ["width", "offset"] as const
    private readonly _map: MlMap
    private readonly _config: LineRenderingConfig
    private readonly _visibility?: Store<boolean>
    private readonly _fetchStore?: (id: string) => Store<OsmTags>
    private readonly _onClick?: (id: string) => void
    private readonly _layername: string
    private readonly _listenerInstalledOn: Set<string> = new Set<string>()

    constructor(
        map: MlMap,
        features: FeatureSource,
        layername: string,
        config: LineRenderingConfig,
        visibility?: Store<boolean>,
        fetchStore?: (id: string) => Store<OsmTags>,
        onClick?: (id: string) => void
    ) {
        this._layername = layername
        this._map = map
        this._config = config
        this._visibility = visibility
        this._fetchStore = fetchStore
        this._onClick = onClick
        const self = this
        features.features.addCallbackAndRunD((features) => self.update(features))
    }

    private calculatePropsFor(
        properties: Record<string, string>
    ): Partial<Record<typeof LineRenderingLayer.lineConfigKeys[number], string>> {
        const calculatedProps = {}
        const config = this._config

        for (const key of LineRenderingLayer.lineConfigKeys) {
            const v = config[key]?.GetRenderValue(properties)?.Subs(properties).txt
            calculatedProps[key] = v
        }
        for (const key of LineRenderingLayer.lineConfigKeysColor) {
            let v = config[key]?.GetRenderValue(properties)?.Subs(properties).txt
            if (v === undefined) {
                continue
            }
            console.log("Color", v)
            if (v.length == 9 && v.startsWith("#")) {
                // This includes opacity
                calculatedProps[key + "-opacity"] = parseInt(v.substring(7), 16) / 256
                v = v.substring(0, 7)
                console.log("Color >", v, calculatedProps[key + "-opacity"])
            }
            calculatedProps[key] = v
        }
        for (const key of LineRenderingLayer.lineConfigKeysNumber) {
            const v = config[key]?.GetRenderValue(properties)?.Subs(properties).txt
            calculatedProps[key] = Number(v)
        }

        console.log("Calculated props:", calculatedProps, "for", properties.id)
        return calculatedProps
    }

    private async update(features: Feature[]) {
        const map = this._map
        while (!map.isStyleLoaded()) {
            await Utils.waitFor(100)
        }
        map.addSource(this._layername, {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features,
            },
            promoteId: "id",
        })

        map.addLayer({
            source: this._layername,
            id: this._layername + "_line",
            type: "line",
            paint: {
                "line-color": ["feature-state", "color"],
                "line-opacity": ["feature-state", "color-opacity"],
                "line-width": ["feature-state", "width"],
                "line-offset": ["feature-state", "offset"],
            },
        })

        /*[
            "color",
            "width",
            "dashArray",
            "lineCap",
            "offset",
            "fill",
            "fillColor",
        ]*/
        map.addLayer({
            source: this._layername,
            id: this._layername + "_polygon",
            type: "fill",
            filter: ["in", ["geometry-type"], ["literal", ["Polygon", "MultiPolygon"]]],
            layout: {},
            paint: {
                "fill-color": ["feature-state", "fillColor"],
                "fill-opacity": 0.1,
            },
        })

        for (let i = 0; i < features.length; i++) {
            const feature = features[i]
            const id = feature.properties.id ?? feature.id
            console.log("ID is", id)
            if (id === undefined) {
                console.trace(
                    "Got a feature without ID; this causes rendering bugs:",
                    feature,
                    "from"
                )
                continue
            }
            if (this._listenerInstalledOn.has(id)) {
                continue
            }
            if (this._fetchStore === undefined) {
                map.setFeatureState(
                    { source: this._layername, id },
                    this.calculatePropsFor(feature.properties)
                )
            } else {
                const tags = this._fetchStore(id)
                this._listenerInstalledOn.add(id)
                tags.addCallbackAndRunD((properties) => {
                    map.setFeatureState(
                        { source: this._layername, id },
                        this.calculatePropsFor(properties)
                    )
                })
            }
        }
    }
}

export default class ShowDataLayer {
    private static rangeLayer = new LayerConfig(
        <LayerConfigJson>range_layer,
        "ShowDataLayer.ts:range.json"
    )
    private readonly _map: Store<MlMap>
    private readonly _options: ShowDataLayerOptions & { layer: LayerConfig }
    private readonly _popupCache: Map<string, ScrollableFullScreen>

    constructor(map: Store<MlMap>, options: ShowDataLayerOptions & { layer: LayerConfig }) {
        this._map = map
        this._options = options
        this._popupCache = new Map()
        const self = this
        map.addCallbackAndRunD((map) => self.initDrawFeatures(map))
    }

    public static showRange(
        map: Store<MlMap>,
        features: FeatureSource,
        doShowLayer?: Store<boolean>
    ): ShowDataLayer {
        return new ShowDataLayer(map, {
            layer: ShowDataLayer.rangeLayer,
            features,
            doShowLayer,
        })
    }

    private openOrReusePopup(id: string): void {
        if (!this._popupCache || !this._options.fetchStore) {
            return
        }
        if (this._popupCache.has(id)) {
            this._popupCache.get(id).Activate()
            return
        }
        const tags = this._options.fetchStore(id)
        if (!tags) {
            return
        }
        const popup = this._options.buildPopup(tags, this._options.layer)
        this._popupCache.set(id, popup)
        popup.Activate()
    }

    private zoomToCurrentFeatures(map: MlMap) {
        if (this._options.zoomToFeatures) {
            const features = this._options.features.features.data
            const bbox = BBox.bboxAroundAll(features.map(BBox.get))
            map.fitBounds(bbox.toLngLat(), {
                padding: { top: 10, bottom: 10, left: 10, right: 10 },
            })
        }
    }

    private initDrawFeatures(map: MlMap) {
        const { features, doShowLayer, fetchStore, buildPopup } = this._options
        const onClick = buildPopup === undefined ? undefined : (id) => this.openOrReusePopup(id)
        for (let i = 0; i < this._options.layer.lineRendering.length; i++) {
            const lineRenderingConfig = this._options.layer.lineRendering[i]
            new LineRenderingLayer(
                map,
                features,
                this._options.layer.id + "_linerendering_" + i,
                lineRenderingConfig,
                doShowLayer,
                fetchStore,
                onClick
            )
        }

        for (const pointRenderingConfig of this._options.layer.mapRendering) {
            new PointRenderingLayer(
                map,
                features,
                pointRenderingConfig,
                doShowLayer,
                fetchStore,
                onClick
            )
        }
        features.features.addCallbackAndRunD((_) => this.zoomToCurrentFeatures(map))
    }
}
