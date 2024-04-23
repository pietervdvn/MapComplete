import { ImmutableStore, Store, UIEventSource } from "../../Logic/UIEventSource"
import type { AddLayerObject, Map as MlMap } from "maplibre-gl"
import { GeoJSONSource, Marker } from "maplibre-gl"
import { ShowDataLayerOptions } from "./ShowDataLayerOptions"
import { GeoOperations } from "../../Logic/GeoOperations"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import PointRenderingConfig from "../../Models/ThemeConfig/PointRenderingConfig"
import { OsmTags } from "../../Models/OsmFeature"
import { FeatureSource, FeatureSourceForLayer } from "../../Logic/FeatureSource/FeatureSource"
import { BBox } from "../../Logic/BBox"
import { Feature, Point } from "geojson"
import LineRenderingConfig from "../../Models/ThemeConfig/LineRenderingConfig"
import { Utils } from "../../Utils"
import * as range_layer from "../../../assets/layers/range/range.json"
import PerLayerFeatureSourceSplitter from "../../Logic/FeatureSource/PerLayerFeatureSourceSplitter"
import FilteredLayer from "../../Models/FilteredLayer"
import SimpleFeatureSource from "../../Logic/FeatureSource/Sources/SimpleFeatureSource"
import { TagsFilter } from "../../Logic/Tags/TagsFilter"

class PointRenderingLayer {
    private readonly _config: PointRenderingConfig
    private readonly _visibility?: Store<boolean>
    private readonly _fetchStore?: (id: string) => Store<Record<string, string>>
    private readonly _map: MlMap
    private readonly _onClick: (feature: Feature) => void
    private readonly _allMarkers: Map<string, Marker> = new Map<string, Marker>()
    private readonly _selectedElement: Store<{ properties: { id?: string } }>
    private readonly _markedAsSelected: HTMLElement[] = []
    private readonly _metatags: Store<Record<string, string>>
    private _dirty = false

    constructor(
        map: MlMap,
        features: FeatureSource,
        config: PointRenderingConfig,
        metatags?: Store<Record<string, string>>,
        visibility?: Store<boolean>,
        fetchStore?: (id: string) => Store<Record<string, string>>,
        onClick?: (feature: Feature) => void,
        selectedElement?: Store<{ properties: { id?: string } }>
    ) {
        this._visibility = visibility
        this._config = config
        this._map = map
        this._metatags = metatags
        this._fetchStore = fetchStore
        this._onClick = onClick
        this._selectedElement = selectedElement
        const self = this
        features.features.addCallbackAndRunD((features) => self.updateFeatures(features))
        visibility?.addCallbackAndRunD((visible) => {
            if (visible === true && self._dirty) {
                self.updateFeatures(features.features.data)
            }
            self.setVisibility(visible)
        })
        selectedElement?.addCallbackAndRun((selected) => {
            this._markedAsSelected.forEach((el) => el.classList.remove("selected"))
            this._markedAsSelected.splice(0, this._markedAsSelected.length)
            if (selected === undefined) {
                return
            }
            PointRenderingConfig.allowed_location_codes.forEach((code) => {
                const marker = this._allMarkers
                    .get(selected.properties?.id + "-" + code)
                    ?.getElement()
                if (marker === undefined) {
                    return
                }
                marker?.classList?.add("selected")
                this._markedAsSelected.push(marker)
            })
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
                if (this._selectedElement?.data === feature.properties.id) {
                    marker.getElement().classList.add("selected")
                    this._markedAsSelected.push(marker.getElement())
                }
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
        const { html, iconAnchor } = this._config.RenderIcon(store, { metatags: this._metatags })
        html.SetClass("marker")
        if (this._onClick !== undefined) {
            html.SetClass("cursor-pointer")
        }
        const el = html.ConstructElement()

        if (this._onClick) {
            const self = this
            el.addEventListener("click", function(ev) {
                ev.preventDefault()
                self._onClick(feature)
                // Workaround to signal the MapLibreAdaptor to ignore this click
                ev["consumed"] = true
            })
        }

        const marker = new Marker({ element: el })
            .setLngLat(loc)
            .setOffset(iconAnchor)
            .addTo(this._map)
        store
            .map((tags) => this._config.pitchAlignment.GetRenderValue(tags).Subs(tags).txt)
            .addCallbackAndRun((pitchAligment) => marker.setPitchAlignment(<any>pitchAligment))
        store
            .map((tags) => this._config.rotationAlignment.GetRenderValue(tags).Subs(tags).txt)
            .addCallbackAndRun((pitchAligment) => marker.setRotationAlignment(<any>pitchAligment))

        if (feature.geometry.type === "Point") {
            // When the tags get 'pinged', check that the location didn't change
            store.addCallbackAndRunD(() => {
                // Check if the location is still the same
                const oldLoc = marker.getLngLat()
                const newloc = (<Point>feature.geometry).coordinates
                if (newloc[0] === oldLoc.lng && newloc[1] === oldLoc.lat) {
                    return
                }
                marker.setLngLat({ lon: newloc[0], lat: newloc[1] })
            })
        }
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
        "fillColor"
    ] as const

    private static readonly lineConfigKeysColor = ["color", "fillColor"] as const
    private static readonly lineConfigKeysNumber = ["width", "offset"] as const
    private static missingIdTriggered = false
    private readonly _map: MlMap
    private readonly _config: LineRenderingConfig
    private readonly _visibility?: Store<boolean>
    private readonly _fetchStore?: (id: string) => Store<Record<string, string>>
    private readonly _onClick?: (feature: Feature) => void
    private readonly _layername: string
    private readonly _listenerInstalledOn: Set<string> = new Set<string>()
    private currentSourceData

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
        features.features.addCallbackAndRunD(() => self.update(features.features))

        map.on("styledata", () => self.update(features.features))
    }

    public destruct(): void {
        this._map.removeLayer(this._layername + "_polygon")
    }

    private async addSymbolLayer(
        sourceId: string,
        imageAlongWay: { if?: TagsFilter; then: string }[]
    ) {
        const map = this._map
        await Promise.allSettled(
            imageAlongWay.map(async (img, i) => {
                const imgId = img.then.replaceAll(/[/.-]/g, "_")
                if (map.getImage(imgId) === undefined) {
                    const loadedImage = await map.loadImage(img.then)
                    map.addImage(imgId, loadedImage.data)
                }

                const spec: AddLayerObject = {
                    id: "symbol-layer_" + this._layername + "-" + i,
                    type: "symbol",
                    source: sourceId,
                    layout: {
                        "symbol-placement": "line",
                        "symbol-spacing": 10,
                        "icon-allow-overlap": true,
                        "icon-rotation-alignment": "map",
                        "icon-pitch-alignment": "map",
                        "icon-image": imgId,
                        "icon-size": 0.055
                    }
                }
                const filter = img.if?.asMapboxExpression()
                if (filter) {
                    spec.filter = filter
                }
                map.addLayer(spec)
            })
        )
    }

    /**
     * Calculate the feature-state for maplibre
     * @param properties
     * @private
     */
    private calculatePropsFor(
        properties: Record<string, string>
    ): Partial<Record<(typeof LineRenderingLayer.lineConfigKeys)[number], string>> {
        const config = this._config

        const calculatedProps: Record<string, string | number> = {}
        for (const key of LineRenderingLayer.lineConfigKeys) {
            calculatedProps[key] = config[key]?.GetRenderValue(properties)?.Subs(properties).txt
        }
        calculatedProps.fillColor = calculatedProps.fillColor ?? calculatedProps.color

        for (const key of LineRenderingLayer.lineConfigKeysColor) {
            let v = <string>calculatedProps[key]
            if (v === undefined) {
                continue
            }
            if (v.length == 9 && v.startsWith("#")) {
                // This includes opacity
                calculatedProps[`${key}-opacity`] = parseInt(v.substring(7), 16) / 256
                calculatedProps[key] = v.substring(0, 7)
            }
        }
        calculatedProps["fillColor-opacity"] = calculatedProps["fillColor-opacity"] ?? 0.1

        for (const key of LineRenderingLayer.lineConfigKeysNumber) {
            calculatedProps[key] = Number(calculatedProps[key])
        }

        return calculatedProps
    }

    private async update(featureSource: Store<Feature[]>) {
        const map = this._map
        while (!map.isStyleLoaded()) {
            await Utils.waitFor(100)
        }

        // After waiting 'till the map has loaded, the data might have changed already
        // As such, we only now read the features from the featureSource and compare with the previously set data
        const features = featureSource.data
        const src = <GeoJSONSource>map.getSource(this._layername)
        if (
            src !== undefined &&
            this.currentSourceData === features &&
            src._data === <any>features
        ) {
            // Already up to date
            return
        }
        {
            // Add source to the map or update the feature source
            if (src === undefined) {
                this.currentSourceData = features
                map.addSource(this._layername, {
                    type: "geojson",
                    data: {
                        type: "FeatureCollection",
                        features
                    },
                    promoteId: "id"
                })
                const linelayer = this._layername + "_line"
                const layer: AddLayerObject = {
                    source: this._layername,
                    id: linelayer,
                    type: "line",
                    paint: {
                        "line-color": ["feature-state", "color"],
                        "line-opacity": ["feature-state", "color-opacity"],
                        "line-width": ["feature-state", "width"],
                        "line-offset": ["feature-state", "offset"]
                    },
                    layout: {
                        "line-cap": "round"
                    }
                }
                if (this._config.dashArray) {
                    layer.paint["line-dasharray"] =
                        this._config.dashArray?.split(" ")?.map((s) => Number(s)) ?? null
                }
                map.addLayer(layer)

                if (this._config.imageAlongWay) {
                    this.addSymbolLayer(this._layername, this._config.imageAlongWay)
                }

                for (const feature of features) {
                    if (!feature.properties.id) {
                        console.warn("Feature without id:", feature)
                        continue
                    }
                    map.setFeatureState(
                        { source: this._layername, id: feature.properties.id },
                        this.calculatePropsFor(feature.properties)
                    )
                }

                map.on("click", linelayer, (e) => {
                    // line-layer-listener
                    e.originalEvent["consumed"] = true
                    this._onClick(e.features[0])
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
                        "fill-opacity": ["feature-state", "fillColor-opacity"]
                    }
                })
                if (this._onClick) {
                    map.on("click", polylayer, (e) => {
                        // polygon-layer-listener
                        if (e.originalEvent["consumed"]) {
                            // This is a polygon beneath a marker, we can ignore it
                            return
                        }
                        e.originalEvent["consumed"] = true
                        this._onClick(e.features[0])
                    })
                }

                this._visibility?.addCallbackAndRunD((visible) => {
                    try {
                        map.setLayoutProperty(linelayer, "visibility", visible ? "visible" : "none")
                        map.setLayoutProperty(polylayer, "visibility", visible ? "visible" : "none")
                    } catch (e) {
                        console.warn(
                            "Error while setting visibility of layers ",
                            linelayer,
                            polylayer,
                            e
                        )
                    }
                })
            } else {
                this.currentSourceData = features
                src.setData({
                    type: "FeatureCollection",
                    features: this.currentSourceData
                })
            }
        }
        for (let i = 0; i < features.length; i++) {
            // Installs a listener on the 'Tags' of every individual feature to update the rendering
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
                tags?.addCallbackAndRunD((properties) => {
                    // Make sure to use 'getSource' here, the layer names are different!
                    try {
                        if (map.getSource(this._layername) === undefined) {
                            return true
                        }
                    } catch (e) {
                        console.debug("Could not fetch source for", this._layername)
                        return
                    }
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
    public static rangeLayer = new LayerConfig(<any>range_layer, "ShowDataLayer.ts:range.json")
    private readonly _options: ShowDataLayerOptions & {
        layer: LayerConfig
        drawMarkers?: true | boolean
        drawLines?: true | boolean
    }

    private onDestroy: (() => void)[] = []

    constructor(
        map: Store<MlMap>,
        options: ShowDataLayerOptions & {
            layer: LayerConfig
            drawMarkers?: true | boolean
            drawLines?: true | boolean
        }
    ) {
        this._options = options
        this.onDestroy.push(map.addCallbackAndRunD((map) => this.initDrawFeatures(map)))
    }

    public static showMultipleLayers(
        mlmap: UIEventSource<MlMap>,
        features: FeatureSource,
        layers: LayerConfig[],
        options?: Partial<ShowDataLayerOptions>
    ) {
        const perLayer: PerLayerFeatureSourceSplitter<FeatureSourceForLayer> =
            new PerLayerFeatureSourceSplitter(
                layers.filter((l) => l.source !== null).map((l) => new FilteredLayer(l)),
                features,
                {
                    constructStore: (features, layer) => new SimpleFeatureSource(layer, features)
                }
            )
        if (options?.zoomToFeatures) {
            options.zoomToFeatures = false
            features.features.addCallbackD(features => {
                ShowDataLayer.zoomToCurrentFeatures(mlmap.data, features)
            })
            mlmap.addCallbackD(map => {
                ShowDataLayer.zoomToCurrentFeatures(map, features.features.data)
            })
        }

        perLayer.forEach((fs) => {
            new ShowDataLayer(mlmap, {
                layer: fs.layer.layerDef,
                features: fs,
                ...(options ?? {})
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
            doShowLayer
        })
    }

    public destruct() {
    }

    private static zoomToCurrentFeatures(map: MlMap, features: Feature[]) {
        if (!features || !map || features.length == 0) {
            return
        }
        const bbox = BBox.bboxAroundAll(features.map(BBox.get))
        console.log("Zooming to features", bbox.asGeoJson())
        window.requestAnimationFrame(() => {

        map.resize()
        map.fitBounds(bbox.toLngLat(), {
            padding: { top: 10, bottom: 10, left: 10, right: 10 },
            animate: false
        })
        })
    }

    private initDrawFeatures(map: MlMap) {
        const { features, doShowLayer, fetchStore, selectedElement } = this._options
        let onClick = this._options.onClick
        if (!onClick && selectedElement) {
            onClick =
                this._options.layer.title === undefined
                    ? undefined
                    : (feature: Feature) => {
                        selectedElement?.setData(feature)
                    }
        }
        if (this._options.drawLines !== false) {
            for (let i = 0; i < this._options.layer.lineRendering.length; i++) {
                const lineRenderingConfig = this._options.layer.lineRendering[i]
                const l = new LineRenderingLayer(
                    map,
                    features,
                    "mapcomplete_" + this._options.layer.id + "_linerendering_" + i,
                    lineRenderingConfig,
                    doShowLayer,
                    fetchStore,
                    onClick
                )
                this.onDestroy.push(l.destruct)
            }
        }
        if (this._options.drawMarkers !== false) {
            for (const pointRenderingConfig of this._options.layer.mapRendering) {
                new PointRenderingLayer(
                    map,
                    features,
                    pointRenderingConfig,
                    this._options.metaTags,
                    doShowLayer,
                    fetchStore,
                    onClick,
                    selectedElement
                )
            }
        }
        if (this._options.zoomToFeatures) {
            features.features.addCallbackAndRunD((features) => ShowDataLayer.zoomToCurrentFeatures(map, features))
        }
    }
}
