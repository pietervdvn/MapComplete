import { Map as MLMap, RasterSourceSpecification, VectorTileSource } from "maplibre-gl"
import { Store, Stores, UIEventSource } from "../../Logic/UIEventSource"
import { AvailableRasterLayers, RasterLayerPolygon } from "../../Models/RasterLayers"
import { RasterLayerProperties } from "../../Models/RasterLayerProperties"
import { Utils } from "../../Utils"
import { VectorSourceSpecification } from "@maplibre/maplibre-gl-style-spec"

class SingleBackgroundHandler {
    // Value between 0 and 1.0
    public opacity = new UIEventSource<number>(0.0)
    private _map: Store<MLMap>
    private _background: UIEventSource<RasterLayerPolygon | undefined>
    private readonly _targetLayer: RasterLayerPolygon
    private _deactivationTime: Date = undefined

    /**
     * Deactivate a layer after 60 seconds
     */
    public static readonly DEACTIVATE_AFTER = 60
    private fadeStep = 0.1

    constructor(
        map: Store<MLMap>,
        targetLayer: RasterLayerPolygon,
        background: UIEventSource<RasterLayerPolygon | undefined>
    ) {
        this._targetLayer = targetLayer
        this._map = map
        this._background = background

        background.addCallback(async () => {
            await this.update()
        })
        map.addCallbackAndRunD(async (map) => {
            map.on("load", async () => {
                await this.update()
            })
            await this.update()
            map.on("moveend", () => this.onMove(map))
            map.on("zoomend", () => this.onMove(map))
        })
    }

    private onMove(map: MLMap) {
        if (!this._deactivationTime) {
            return
        }
        // in seconds
        const timeSinceDeactivation =
            (new Date().getTime() - this._deactivationTime.getTime()) / 1000

        if (timeSinceDeactivation < SingleBackgroundHandler.DEACTIVATE_AFTER) {
            return
        }

        console.debug(
            "Removing raster layer",
            this._targetLayer.properties.id,
            "map moved and not been used for",
            SingleBackgroundHandler.DEACTIVATE_AFTER
        )
        if (map.getLayer(<string>this._targetLayer.properties.id)) {
            map.removeLayer(<string>this._targetLayer.properties.id)
        }
    }

    private async update() {
        const newTarget: RasterLayerPolygon | undefined = this._background.data
        const targetLayer = this._targetLayer
        if (newTarget?.properties?.id !== targetLayer.properties.id) {
            this._deactivationTime = new Date()
            await this.awaitStyleIsLoaded()
            this.fadeOut()
        } else {
            this._deactivationTime = undefined
            await this.enable()
            this.fadeIn()
        }
    }

    private async awaitStyleIsLoaded(): Promise<void> {
        const map = this._map.data
        if (!map) {
            return
        }
        while (!map?.isStyleLoaded()) {
            await Utils.waitFor(250)
        }
    }

    private async enable() {
        let ttl = 15
        await this.awaitStyleIsLoaded()
        while (!this.tryEnable() && ttl > 0) {
            ttl--
            await Utils.waitFor(250)
        }
    }

    /**
     * Returns 'false' if should be attempted again
     * @private
     */
    private tryEnable(): boolean {
        const map: MLMap = this._map.data
        if (!map) {
            return true
        }
        const background = this._targetLayer.properties
        console.debug("Enabling", background.id)
        let addLayerBeforeId = "transit_pier" // this is the first non-landuse item in the stylesheet, we add the raster layer before the roads but above the landuse
        if (!map.getLayer(addLayerBeforeId)) {
            console.warn(
                "Layer",
                addLayerBeforeId,
                "not foundhttp://127.0.0.1:1234/theme.html?layout=cyclofix&z=14.8&lat=51.05282501324558&lon=3.720591622281745&layer-range=true"
            )
            addLayerBeforeId = undefined
        }
        if (background.category === "osmbasedmap" || background.category === "map") {
            // The background layer is already an OSM-based map or another map, so we don't want anything from the baselayer
            addLayerBeforeId = undefined
        }

        if (!map.getSource(background.id)) {
            try {
                map.addSource(background.id, RasterLayerHandler.prepareSource(background))
            } catch (e) {
                return false
            }
        }
        if (!map.getLayer(background.id)) {
            addLayerBeforeId ??= map
                .getStyle()
                .layers.find((l) => l.id.startsWith("mapcomplete_"))?.id

            if (background.type === "vector") {
                const styleToSet = background.style ?? background.url
                map.setStyle(styleToSet)
            } else {
                map.addLayer(
                    {
                        id: background.id,
                        type: "raster",
                        source: background.id,
                        paint: {
                            "raster-opacity": 0,
                        },
                    },
                    addLayerBeforeId
                )
                this.opacity.addCallbackAndRun((o) => {
                    try {
                        map.setPaintProperty(background.id, "raster-opacity", o)
                    } catch (e) {
                        console.debug("Could not set raster-opacity of", background.id)
                        return true // This layer probably doesn't exist anymore, so we unregister
                    }
                })
            }
        }
        return true
    }

    private fadeOut() {
        Stores.Chronic(
            8,
            () => this.opacity.data > 0 && this._deactivationTime !== undefined
        ).addCallback((_) => this.opacity.setData(Math.max(0, this.opacity.data - this.fadeStep)))
    }

    private fadeIn() {
        Stores.Chronic(
            8,
            () => this.opacity.data < 1.0 && this._deactivationTime === undefined
        ).addCallback((_) => this.opacity.setData(Math.min(1.0, this.opacity.data + this.fadeStep)))
    }
}

export default class RasterLayerHandler {
    private _singleLayerHandlers: Record<string, SingleBackgroundHandler> = {}

    constructor(map: Store<MLMap>, background: UIEventSource<RasterLayerPolygon | undefined>) {
        background.addCallbackAndRunD((l) => {
            const key = l.properties.id
            if (!this._singleLayerHandlers[key]) {
                this._singleLayerHandlers[key] = new SingleBackgroundHandler(map, l, background)
            }
        })
    }

    public static prepareSource(
        layer: RasterLayerProperties
    ): RasterSourceSpecification | VectorSourceSpecification {
        if (layer.type === "vector") {
            const vs: VectorSourceSpecification = {
                type: "vector",
                url: layer.url,
            }
            return vs
        }
        return {
            type: "raster",
            // use the tiles option to specify a 256WMS tile source URL
            // https://maplibre.org/maplibre-gl-js-docs/style-spec/sources/
            tiles: [RasterLayerHandler.prepareWmsURL(layer.url, layer["tile-size"] ?? 256)],
            tileSize: layer["tile-size"] ?? 256,
            minzoom: layer["min_zoom"] ?? 1,
            maxzoom: layer["max_zoom"] ?? 25,
            // Bit of a hack, but seems to work
            scheme: layer.url.includes("{-y}") ? "tms" : "xyz",
        }
    }

    private static prepareWmsURL(url: string, size: number = 256): string {
        // ELI:  LAYERS=OGWRGB13_15VL&STYLES=&FORMAT=image/jpeg&CRS={proj}&WIDTH={width}&HEIGHT={height}&BBOX={bbox}&VERSION=1.3.0&SERVICE=WMS&REQUEST=GetMap
        // PROD: SERVICE=WMS&REQUEST=GetMap&LAYERS=OGWRGB13_15VL&STYLES=&FORMAT=image/jpeg&TRANSPARENT=false&VERSION=1.3.0&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX=488585.4847988467,6590094.830634755,489196.9810251281,6590706.32686104

        const toReplace = {
            "{bbox}": "{bbox-epsg-3857}",
            "{proj}": "EPSG:3857",
            "{width}": "" + size,
            "{height}": "" + size,
            "{zoom}": "{z}",
            "{-y}": "{y}",
        }

        for (const key in toReplace) {
            url = url.replace(new RegExp(key), toReplace[key])
        }

        const subdomains = url.match(/\{switch:([a-zA-Z0-9,]*)}/)
        if (subdomains !== null) {
            const options = subdomains[1].split(",")
            const option = options[Math.floor(Math.random() * options.length)]
            url = url.replace(subdomains[0], option)
        }

        return url
    }
}
