import { Store, UIEventSource } from "../../Logic/UIEventSource"
import type { Map as MLMap } from "maplibre-gl"
import { Map as MlMap } from "maplibre-gl"
import { RasterLayerPolygon, RasterLayerProperties } from "../../Models/RasterLayers"
import { Utils } from "../../Utils"
import { BBox } from "../../Logic/BBox"
import { MapProperties } from "../../Models/MapProperties"
import SvelteUIElement from "../Base/SvelteUIElement"
import MaplibreMap from "./MaplibreMap.svelte"
import Constants from "../../Models/Constants"

/**
 * The 'MapLibreAdaptor' bridges 'MapLibre' with the various properties of the `MapProperties`
 */
export class MapLibreAdaptor implements MapProperties {
    private static maplibre_control_handlers = [
        // "scrollZoom",
        // "boxZoom",
        // "doubleClickZoom",
        "dragRotate",
        "dragPan",
        "keyboard",
        "touchZoomRotate",
    ]
    readonly location: UIEventSource<{ lon: number; lat: number }>
    readonly zoom: UIEventSource<number>
    readonly bounds: Store<BBox>
    readonly rasterLayer: UIEventSource<RasterLayerPolygon | undefined>
    readonly maxbounds: UIEventSource<BBox | undefined>
    readonly allowMoving: UIEventSource<true | boolean | undefined>
    private readonly _maplibreMap: Store<MLMap>
    private readonly _bounds: UIEventSource<BBox>
    /**
     * Used for internal bookkeeping (to remove a rasterLayer when done loading)
     * @private
     */
    private _currentRasterLayer: string

    constructor(maplibreMap: Store<MLMap>, state?: Partial<Omit<MapProperties, "bounds">>) {
        this._maplibreMap = maplibreMap

        this.location = state?.location ?? new UIEventSource({ lon: 0, lat: 0 })
        this.zoom = state?.zoom ?? new UIEventSource(1)
        this.zoom.addCallbackAndRunD((z) => {
            if (z < 0) {
                this.zoom.setData(0)
            }
            if (z > 24) {
                this.zoom.setData(24)
            }
        })
        this.maxbounds = state?.maxbounds ?? new UIEventSource(undefined)
        this.allowMoving = state?.allowMoving ?? new UIEventSource(true)
        this._bounds = new UIEventSource(BBox.global)
        this.bounds = this._bounds
        this.rasterLayer =
            state?.rasterLayer ?? new UIEventSource<RasterLayerPolygon | undefined>(undefined)

        const self = this
        maplibreMap.addCallbackAndRunD((map) => {
            map.on("load", () => {
                self.setBackground()
                self.MoveMapToCurrentLoc(self.location.data)
                self.SetZoom(self.zoom.data)
                self.setMaxBounds(self.maxbounds.data)
                self.setAllowMoving(self.allowMoving.data)
            })
            self.MoveMapToCurrentLoc(self.location.data)
            self.SetZoom(self.zoom.data)
            self.setMaxBounds(self.maxbounds.data)
            self.setAllowMoving(self.allowMoving.data)
            map.on("moveend", () => {
                const dt = this.location.data
                dt.lon = map.getCenter().lng
                dt.lat = map.getCenter().lat
                this.location.ping()
                this.zoom.setData(Math.round(map.getZoom() * 10) / 10)
            })
        })

        this.rasterLayer.addCallback((_) =>
            self.setBackground().catch((_) => {
                console.error("Could not set background")
            })
        )

        this.location.addCallbackAndRunD((loc) => {
            self.MoveMapToCurrentLoc(loc)
        })
        this.zoom.addCallbackAndRunD((z) => self.SetZoom(z))
        this.maxbounds.addCallbackAndRun((bbox) => self.setMaxBounds(bbox))
        this.allowMoving.addCallbackAndRun((allowMoving) => self.setAllowMoving(allowMoving))
    }

    /**
     * Convenience constructor
     */
    public static construct(): {
        map: Store<MLMap>
        ui: SvelteUIElement
        mapproperties: MapProperties
    } {
        const mlmap = new UIEventSource<MlMap>(undefined)
        return {
            map: mlmap,
            ui: new SvelteUIElement(MaplibreMap, {
                map: mlmap,
            }),
            mapproperties: new MapLibreAdaptor(mlmap),
        }
    }

    /**
     * Prepares an ELI-URL to be compatible with mapbox
     */
    private static prepareWmsURL(url: string, size: number = 256) {
        // ELI:  LAYERS=OGWRGB13_15VL&STYLES=&FORMAT=image/jpeg&CRS={proj}&WIDTH={width}&HEIGHT={height}&BBOX={bbox}&VERSION=1.3.0&SERVICE=WMS&REQUEST=GetMap
        // PROD: SERVICE=WMS&REQUEST=GetMap&LAYERS=OGWRGB13_15VL&STYLES=&FORMAT=image/jpeg&TRANSPARENT=false&VERSION=1.3.0&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX=488585.4847988467,6590094.830634755,489196.9810251281,6590706.32686104

        const toReplace = {
            "{bbox}": "{bbox-epsg-3857}",
            "{proj}": "EPSG:3857",
            "{width}": "" + size,
            "{height}": "" + size,
            "{zoom}": "{z}",
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

    private SetZoom(z: number) {
        const map = this._maplibreMap.data
        if (!map || z === undefined) {
            return
        }
        if (Math.abs(map.getZoom() - z) > 0.01) {
            map.setZoom(z)
        }
    }

    private MoveMapToCurrentLoc(loc: { lat: number; lon: number }) {
        const map = this._maplibreMap.data
        if (!map || loc === undefined) {
            return
        }

        const center = map.getCenter()
        if (center.lng !== loc.lon || center.lat !== loc.lat) {
            map.setCenter({ lng: loc.lon, lat: loc.lat })
        }
    }

    private async awaitStyleIsLoaded(): Promise<void> {
        const map = this._maplibreMap.data
        if (map === undefined) {
            return
        }
        while (!map.isStyleLoaded()) {
            await Utils.waitFor(250)
        }
    }

    private removeCurrentLayer(map: MLMap) {
        if (this._currentRasterLayer) {
            // hide the previous layer
            map.removeLayer(this._currentRasterLayer)
            map.removeSource(this._currentRasterLayer)
        }
    }

    private async setBackground() {
        const map = this._maplibreMap.data
        if (map === undefined) {
            return
        }
        const background: RasterLayerProperties = this.rasterLayer?.data?.properties
        if (background !== undefined && this._currentRasterLayer === background.id) {
            // already the correct background layer, nothing to do
            return
        }
        await this.awaitStyleIsLoaded()

        if (background !== this.rasterLayer?.data?.properties) {
            // User selected another background in the meantime... abort
            return
        }

        if (background !== undefined && this._currentRasterLayer === background.id) {
            // already the correct background layer, nothing to do
            return
        }
        if (background === undefined) {
            // no background to set
            this.removeCurrentLayer(map)
            this._currentRasterLayer = undefined
            return
        }

        map.addSource(background.id, {
            type: "raster",
            // use the tiles option to specify a 256WMS tile source URL
            // https://maplibre.org/maplibre-gl-js-docs/style-spec/sources/
            tiles: [MapLibreAdaptor.prepareWmsURL(background.url, background["tile-size"] ?? 256)],
            tileSize: background["tile-size"] ?? 256,
            minzoom: background["min_zoom"] ?? 1,
            maxzoom: background["max_zoom"] ?? 25,
            //  scheme: background["type"] === "tms" ? "tms" : "xyz",
        })

        map.addLayer(
            {
                id: background.id,
                type: "raster",
                source: background.id,
                paint: {},
            },
            background.category === "osmbasedmap" || background.category === "map"
                ? undefined
                : "aeroway_fill"
        )
        await this.awaitStyleIsLoaded()
        this.removeCurrentLayer(map)
        this._currentRasterLayer = background?.id
    }

    private setMaxBounds(bbox: undefined | BBox) {
        const map = this._maplibreMap.data
        if (map === undefined) {
            return
        }
        if (bbox) {
            map.setMaxBounds(bbox.toLngLat())
        } else {
            map.setMaxBounds(null)
        }
    }

    private setAllowMoving(allow: true | boolean | undefined) {
        const map = this._maplibreMap.data
        if (map === undefined) {
            return
        }
        if (allow === false) {
            for (const id of MapLibreAdaptor.maplibre_control_handlers) {
                map[id].disable()
            }
        } else {
            for (const id of MapLibreAdaptor.maplibre_control_handlers) {
                map[id].enable()
            }
        }
    }
}
