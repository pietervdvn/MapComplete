import { Map as MLMap, RasterSourceSpecification, VectorTileSource } from "maplibre-gl"
import { Store, Stores, UIEventSource } from "../../Logic/UIEventSource"
import { RasterLayerPolygon } from "../../Models/RasterLayers"
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
    public addBeforeId: UIEventSource<string | undefined>

    /**
     * Deactivate a layer after 60 seconds
     */
    public static readonly DEACTIVATE_AFTER = 60
    private fadeStep = 0.1

    constructor(
        map: Store<MLMap>,
        targetLayer: RasterLayerPolygon,
        background: UIEventSource<RasterLayerPolygon | undefined>,
        addBeforeId?: UIEventSource<string | undefined>
    ) {
        this._targetLayer = targetLayer
        this._map = map
        this._background = background
        this.addBeforeId = addBeforeId ?? new UIEventSource<string | undefined>(undefined)

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
        this.addBeforeId.addCallbackAndRunD(async () => {
            // We need to remove the layer and re-add it (if it exists) to change the order
            const map = this._map.data
            if (!map) {
                return
            }
            if (map.getLayer(<string>this._targetLayer.properties.id)) {
                map.removeLayer(<string>this._targetLayer.properties.id)
            }
            this.tryEnable()
        })
    }

    public onMove(map: MLMap) {
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
        try {
            if (map.getLayer(<string>this._targetLayer.properties.id)) {
                map.removeLayer(<string>this._targetLayer.properties.id)
            }
        } catch (e) {
            console.warn("Could not (try to) remove the raster layer", e)
        }
    }

    public async update() {
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
            await Utils.waitFor(100)
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
            console.warn("Layer", addLayerBeforeId, "not found")
            addLayerBeforeId = undefined
        }
        if (background.category === "osmbasedmap" || background.category === "map") {
            // The background layer is already an OSM-based map or another map, so we don't want anything from the baselayer
            addLayerBeforeId = undefined
        }
        if (background.isOverlay) {
            // This is an overlay, so we want to add it on top of everything
            addLayerBeforeId = undefined
        }

        if (!map.getSource(background.id)) {
            try {
                console.debug(
                    "Adding source",
                    background.id,
                    RasterLayerHandler.prepareSource(background)
                )
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

/**
 * Class that handles overlays and their order
 * TODO: Currently if an osm-based map is added, it will be added on top of the overlays, so they're invisible.
 */
export class OverlayHandler {
    private _map: Store<MLMap>
    private _backgrounds: UIEventSource<RasterLayerPolygon[]>
    private _handlers: Record<string, SingleBackgroundHandler> = {}

    constructor(map: Store<MLMap>, backgrounds: UIEventSource<RasterLayerPolygon[]>) {
        this._map = map
        this._backgrounds = backgrounds

        backgrounds.addCallbackAndRunD(async () => {
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
        Object.values(this._handlers).forEach((handler) => handler.onMove(map))
    }

    private async update() {
        const newTargets: RasterLayerPolygon[] = this._backgrounds.data.slice().reverse()
        const existingKeys = Object.keys(this._handlers)

        // Hide handlers for layers that are no longer in the list
        existingKeys.forEach((key) => {
            if (!newTargets.find((layer) => layer.properties.id === key)) {
                this._handlers[key].opacity.setData(0)
            }
        })

        // Add or update handlers for new or existing layers
        newTargets.forEach((layer) => {
            const key = layer.properties.id

            // Make sure we set the correct order
            // For our top overlay (first one in the list), this will be undefined
            // For all other ones this will be the id of the previous one
            let addBeforeId: string | undefined = undefined

            if (newTargets[0].properties.id === key) {
                addBeforeId = undefined
            } else {
                const previousLayer =
                    newTargets[newTargets.findIndex((l) => l.properties.id === key) - 1]
                addBeforeId = previousLayer.properties.id
            }

            if (!this._handlers[key]) {
                this._handlers[key] = new SingleBackgroundHandler(
                    this._map,
                    layer,
                    new UIEventSource(layer),
                    new UIEventSource(addBeforeId)
                )
            } else {
                this._handlers[key].opacity.setData(1)
                this._handlers[key].update()
                this._handlers[key].addBeforeId.setData(addBeforeId)
            }
        })
    }
}
