import { Store, UIEventSource } from "../../Logic/UIEventSource"
import type { Map as MLMap } from "maplibre-gl"
import { Map as MlMap } from "maplibre-gl"
import { RasterLayerPolygon, RasterLayerProperties } from "../../Models/RasterLayers"
import { Utils } from "../../Utils"
import { BBox } from "../../Logic/BBox"
import { ExportableMap, MapProperties } from "../../Models/MapProperties"
import SvelteUIElement from "../Base/SvelteUIElement"
import MaplibreMap from "./MaplibreMap.svelte"
import html2canvas from "html2canvas"

/**
 * The 'MapLibreAdaptor' bridges 'MapLibre' with the various properties of the `MapProperties`
 */
export class MapLibreAdaptor implements MapProperties, ExportableMap {
    private static maplibre_control_handlers = [
        // "scrollZoom",
        // "boxZoom",
        // "doubleClickZoom",
        "dragRotate",
        "dragPan",
        "keyboard",
        "touchZoomRotate",
    ]
    private static maplibre_zoom_handlers = [
        "scrollZoom",
        "boxZoom",
        "doubleClickZoom",
        "touchZoomRotate",
    ]
    readonly location: UIEventSource<{ lon: number; lat: number }>
    readonly zoom: UIEventSource<number>
    readonly bounds: UIEventSource<BBox>
    readonly rasterLayer: UIEventSource<RasterLayerPolygon | undefined>
    readonly maxbounds: UIEventSource<BBox | undefined>
    readonly allowMoving: UIEventSource<true | boolean | undefined>
    readonly allowZooming: UIEventSource<true | boolean | undefined>
    readonly lastClickLocation: Store<undefined | { lon: number; lat: number }>
    readonly minzoom: UIEventSource<number>
    private readonly _maplibreMap: Store<MLMap>
    /**
     * Used for internal bookkeeping (to remove a rasterLayer when done loading)
     * @private
     */
    private _currentRasterLayer: string

    constructor(maplibreMap: Store<MLMap>, state?: Partial<MapProperties>) {
        this._maplibreMap = maplibreMap

        this.location = state?.location ?? new UIEventSource({ lon: 0, lat: 0 })
        this.zoom = state?.zoom ?? new UIEventSource(1)
        this.minzoom = state?.minzoom ?? new UIEventSource(0)
        this.zoom.addCallbackAndRunD((z) => {
            if (z < this.minzoom.data) {
                this.zoom.setData(this.minzoom.data)
            }
            if (z > 24) {
                this.zoom.setData(24)
            }
        })
        this.maxbounds = state?.maxbounds ?? new UIEventSource(undefined)
        this.allowMoving = state?.allowMoving ?? new UIEventSource(true)
        this.allowZooming = state?.allowZooming ?? new UIEventSource(true)
        this.bounds = state?.bounds ?? new UIEventSource(undefined)
        this.rasterLayer =
            state?.rasterLayer ?? new UIEventSource<RasterLayerPolygon | undefined>(undefined)

        const lastClickLocation = new UIEventSource<{ lon: number; lat: number }>(undefined)
        this.lastClickLocation = lastClickLocation
        const self = this

        function handleClick(e) {
            if (e.originalEvent["consumed"]) {
                // Workaround, 'ShowPointLayer' sets this flag
                return
            }
            console.log(e)
            const lon = e.lngLat.lng
            const lat = e.lngLat.lat
            lastClickLocation.setData({ lon, lat })
        }

        maplibreMap.addCallbackAndRunD((map) => {
            map.on("load", () => {
                this.updateStores()
                self.setBackground()
                self.MoveMapToCurrentLoc(self.location.data)
                self.SetZoom(self.zoom.data)
                self.setMaxBounds(self.maxbounds.data)
                self.setAllowMoving(self.allowMoving.data)
                self.setAllowZooming(self.allowZooming.data)
                self.setMinzoom(self.minzoom.data)
                self.setBounds(self.bounds.data)
            })
            self.MoveMapToCurrentLoc(self.location.data)
            self.SetZoom(self.zoom.data)
            self.setMaxBounds(self.maxbounds.data)
            self.setAllowMoving(self.allowMoving.data)
            self.setAllowZooming(self.allowZooming.data)
            self.setMinzoom(self.minzoom.data)
            self.setBounds(self.bounds.data)
            this.updateStores()
            map.on("moveend", () => this.updateStores())
            map.on("click", (e) => {
                handleClick(e)
            })
            map.on("contextmenu", (e) => {
                handleClick(e)
            })
            map.on("dblclick", (e) => {
                handleClick(e)
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
        this.allowZooming.addCallbackAndRun((allowZooming) => self.setAllowZooming(allowZooming))
        this.bounds.addCallbackAndRunD((bounds) => self.setBounds(bounds))
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

    async exportAsPng(): Promise<Blob> {
        const map = this._maplibreMap.data
        if (map === undefined) {
            return undefined
        }

        function setDPI(canvas, dpi) {
            // Set up CSS size.
            canvas.style.width = canvas.style.width || canvas.width + "px"
            canvas.style.height = canvas.style.height || canvas.height + "px"

            // Resize canvas and scale future draws.
            const scaleFactor = dpi / 96
            canvas.width = Math.ceil(canvas.width * scaleFactor)
            canvas.height = Math.ceil(canvas.height * scaleFactor)
            const ctx = canvas.getContext("2d")
            ctx?.scale(scaleFactor, scaleFactor)
        }

        // Total hack - see https://stackoverflow.com/questions/42483449/mapbox-gl-js-export-map-to-png-or-pdf

        const drawOn = document.createElement("canvas")
        drawOn.width = document.documentElement.clientWidth
        drawOn.height = document.documentElement.clientHeight

        setDPI(drawOn, 4 * 96)

        const destinationCtx = drawOn.getContext("2d")
        {
            // First, we draw the maplibre-map onto the canvas. This does not export markers
            // Inspiration by https://github.com/mapbox/mapbox-gl-js/issues/2766

            const promise = new Promise<void>((resolve) => {
                map.once("render", () => {
                    destinationCtx.drawImage(map.getCanvas(), 0, 0)
                    resolve()
                })
            })

            while (!map.isStyleLoaded()) {
                console.log("Waiting to fully load the style...")
                await Utils.waitFor(100)
            }
            map.triggerRepaint()
            await promise
            // Reset the canvas width and height
            map.resize()
        }
        {
            // now, we draw the markers on top of the map

            /* We use html2canvas for this, but disable the map canvas object itself:
             * it cannot deal with this canvas object.
             *
             * We also have to patch up a few more objects
             * */
            const container = map.getCanvasContainer()
            const origHeight = container.style.height
            const origStyle = map.getCanvas().style.display
            try {
                map.getCanvas().style.display = "none"
                if (!container.style.height) {
                    container.style.height = document.documentElement.clientHeight + "px"
                }

                await html2canvas(
                    map.getCanvasContainer(),
                    {
                        backgroundColor: "#00000000",
                        canvas: drawOn,
                    }
                )
            } catch (e) {
                console.error(e)
            } finally {
                map.getCanvas().style.display = origStyle
                container.style.height = origHeight
            }
        }

        // At last, we return the actual blob
        return new Promise<Blob>((resolve) => drawOn.toBlob((data) => resolve(data)))
    }

    private updateStores() {
        const map = this._maplibreMap.data
        if (map === undefined) {
            return
        }
        const dt = this.location.data
        dt.lon = map.getCenter().lng
        dt.lat = map.getCenter().lat
        this.location.ping()
        this.zoom.setData(Math.round(map.getZoom() * 10) / 10)
        const bounds = map.getBounds()
        const bbox = new BBox([
            [bounds.getEast(), bounds.getNorth()],
            [bounds.getWest(), bounds.getSouth()],
        ])
        this.bounds.setData(bbox)
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
        while (!map?.isStyleLoaded()) {
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
        if (!background?.url) {
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
            map?.setMaxBounds(bbox.toLngLat())
        } else {
            map?.setMaxBounds(null)
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

    private setMinzoom(minzoom: number) {
        const map = this._maplibreMap.data
        if (map === undefined) {
            return
        }
        map.setMinZoom(minzoom)
    }

    private setAllowZooming(allow: true | boolean | undefined) {
        const map = this._maplibreMap.data
        if (map === undefined) {
            return
        }
        if (allow === false) {
            for (const id of MapLibreAdaptor.maplibre_zoom_handlers) {
                map[id].disable()
            }
        } else {
            for (const id of MapLibreAdaptor.maplibre_zoom_handlers) {
                map[id].enable()
            }
        }
    }

    private setBounds(bounds: BBox) {
        const map = this._maplibreMap.data
        if (map === undefined || bounds === undefined) {
            return
        }
        const oldBounds = map.getBounds()
        const e = 0.0000001
        const hasDiff =
            Math.abs(oldBounds.getWest() - bounds.getWest()) > e &&
            Math.abs(oldBounds.getEast() - bounds.getEast()) > e &&
            Math.abs(oldBounds.getNorth() - bounds.getNorth()) > e &&
            Math.abs(oldBounds.getSouth() - bounds.getSouth()) > e
        if (!hasDiff) {
            return
        }
        map.fitBounds(bounds.toLngLat())
    }
}
