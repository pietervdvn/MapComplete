import { ImmutableStore, Store, UIEventSource } from "../../Logic/UIEventSource"
import type { Map as MlMap } from "maplibre-gl"
import { GeoJSONSource, Marker } from "maplibre-gl"
import { ShowDataLayerOptions } from "./ShowDataLayerOptions"
import { GeoOperations } from "../../Logic/GeoOperations"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import PointRenderingConfig from "../../Models/ThemeConfig/PointRenderingConfig"
import { OsmTags } from "../../Models/OsmFeature"
import { FeatureSource } from "../../Logic/FeatureSource/FeatureSource"
import { BBox } from "../../Logic/BBox"
import { Feature } from "geojson"
import ScrollableFullScreen from "../Base/ScrollableFullScreen"
import LineRenderingConfig from "../../Models/ThemeConfig/LineRenderingConfig"
import { Utils } from "../../Utils"
import * as range_layer from "../../assets/layers/range/range.json"
import { LayerConfigJson } from "../../Models/ThemeConfig/Json/LayerConfigJson"
import PerLayerFeatureSourceSplitter from "../../Logic/FeatureSource/PerLayerFeatureSourceSplitter"
import FilteredLayer from "../../Models/FilteredLayer"
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource"

class PointRenderingLayer {
    private readonly _config: PointRenderingConfig
    private readonly _visibility?: Store<boolean>
    private readonly _fetchStore?: (id: string) => Store<Record<string, string>>
    private readonly _map: MlMap
    private readonly _onClick: (feature: Feature) => void
    private readonly _allMarkers: Map<string, Marker> = new Map<string, Marker>()
    private _dirty = false
    constructor(
        map: MlMap,
        features: FeatureSource,
        config: PointRenderingConfig,
        visibility?: Store<boolean>,
        fetchStore?: (id: string) => Store<Record<string, string>>,
        onClick?: (feature: Feature) => void
    ) {
        this._visibility = visibility
        this._config = config
        this._map = map
        this._fetchStore = fetchStore
        this._onClick = onClick
        const self = this

        features.features.addCallbackAndRunD((features) => self.updateFeatures(features))
        visibility?.addCallbackAndRunD((visible) => {
            if (visible === true && self._dirty) {
                self.updateFeatures(features.features.data)
            }
            self.setVisibility(visible)
        })
    }

    private updateFeatures(features: Feature[]) {
        if (this._visibility?.data === false) {
            this._dirty = true
            return
        }
        this._dirty = false
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
                const id = feature.properties.id + "-" + location
                unseenKeys.delete(id)

                const loc = GeoOperations.featureToCoordinateWithRenderingType(
                    <any>feature,
                    location
                )
                if (loc === undefined) {
                    continue
                }

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
        let store: Store<Record<string, string>>
        if (this._fetchStore) {
            store = this._fetchStore(feature.properties.id)
        } else {
            store = new ImmutableStore(<OsmTags>feature.properties)
        }
        const { html, iconAnchor } = this._config.RenderIcon(store, true)
        html.SetClass("marker cursor-pointer")
        const el = html.ConstructElement()

        if (this._onClick) {
            const self = this
            el.addEventListener("click", function (ev) {
                self._onClick(feature)
                ev.preventDefault()
                // Workaround to signal the MapLibreAdaptor to ignore this click
                ev["consumed"] = true
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
    private readonly _fetchStore?: (id: string) => Store<Record<string, string>>
    private readonly _onClick?: (feature: Feature) => void
    private readonly _layername: string
    private readonly _listenerInstalledOn: Set<string> = new Set<string>()

    private static missingIdTriggered = false
    constructor(
        map: MlMap,
        features: FeatureSource,
        layername: string,
        config: LineRenderingConfig,
        visibility?: Store<boolean>,
        fetchStore?: (id: string) => Store<Record<string, string>>,
        onClick?: (feature: Feature) => void
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
            calculatedProps[key] = config[key]?.GetRenderValue(properties)?.Subs(properties).txt
        }
        for (const key of LineRenderingLayer.lineConfigKeysColor) {
            let v = config[key]?.GetRenderValue(properties)?.Subs(properties).txt
            if (v === undefined) {
                continue
            }
            if (v.length == 9 && v.startsWith("#")) {
                // This includes opacity
                calculatedProps[key + "-opacity"] = parseInt(v.substring(7), 16) / 256
                v = v.substring(0, 7)
            }
            calculatedProps[key] = v
        }
        for (const key of LineRenderingLayer.lineConfigKeysNumber) {
            const v = config[key]?.GetRenderValue(properties)?.Subs(properties).txt
            calculatedProps[key] = Number(v)
        }

        return calculatedProps
    }

    private async update(features: Feature[]) {
        const map = this._map
        while (!map.isStyleLoaded()) {
            await Utils.waitFor(100)
        }
        const src = <GeoJSONSource>map.getSource(this._layername)
        if (src === undefined) {
            map.addSource(this._layername, {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features,
                },
                promoteId: "id",
            })
            // @ts-ignore
            const linelayer = this._layername + "_line"
            map.addLayer({
                source: this._layername,
                id: linelayer,
                type: "line",
                paint: {
                    "line-color": ["feature-state", "color"],
                    "line-opacity": ["feature-state", "color-opacity"],
                    "line-width": ["feature-state", "width"],
                    "line-offset": ["feature-state", "offset"],
                },
                layout: {
                    "line-cap": "round",
                },
            })

            const polylayer = this._layername + "_polygon"
            map.addLayer({
                source: this._layername,
                id: polylayer,
                type: "fill",
                filter: ["in", ["geometry-type"], ["literal", ["Polygon", "MultiPolygon"]]],
                layout: {},
                paint: {
                    "fill-color": ["feature-state", "fillColor"],
                    "fill-opacity": 0.1,
                },
            })

            this._visibility?.addCallbackAndRunD((visible) => {
                try {
                    map.setLayoutProperty(linelayer, "visibility", visible ? "visible" : "none")
                    map.setLayoutProperty(polylayer, "visibility", visible ? "visible" : "none")
                } catch (e) {
                    console.warn(
                        "Error while setting visiblity of layers ",
                        linelayer,
                        polylayer,
                        e
                    )
                }
            })
        } else {
            src.setData({
                type: "FeatureCollection",
                features,
            })
        }

        for (let i = 0; i < features.length; i++) {
            const feature = features[i]
            const id = feature.properties.id ?? feature.id
            if (id === undefined) {
                if (!LineRenderingLayer.missingIdTriggered) {
                    console.trace(
                        "Got a feature without ID; this causes rendering bugs:",
                        feature,
                        "from"
                    )
                    LineRenderingLayer.missingIdTriggered = true
                }
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

    public static showMultipleLayers(
        mlmap: UIEventSource<MlMap>,
        features: FeatureSource,
        layers: LayerConfig[],
        options?: Partial<ShowDataLayerOptions>
    ) {
        const perLayer = new PerLayerFeatureSourceSplitter(
            layers.filter((l) => l.source !== null).map((l) => new FilteredLayer(l)),
            new StaticFeatureSource(features)
        )
        perLayer.forEach((fs) => {
            new ShowDataLayer(mlmap, {
                layer: fs.layer.layerDef,
                features: fs,
                ...(options ?? {}),
            })
        })
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
        let { features, doShowLayer, fetchStore, selectedElement, selectedLayer } = this._options
        const onClick =
            this._options.onClick ??
            ((feature: Feature) => {
                selectedElement?.setData(feature)
                selectedLayer?.setData(this._options.layer)
            })
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
