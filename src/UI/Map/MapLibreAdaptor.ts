import { Store, UIEventSource } from "../../Logic/UIEventSource"
import type { Map as MLMap } from "maplibre-gl"
import { Map as MlMap, SourceSpecification } from "maplibre-gl"
import { AvailableRasterLayers, RasterLayerPolygon } from "../../Models/RasterLayers"
import { Utils } from "../../Utils"
import { BBox } from "../../Logic/BBox"
import { ExportableMap, MapProperties } from "../../Models/MapProperties"
import SvelteUIElement from "../Base/SvelteUIElement"
import MaplibreMap from "./MaplibreMap.svelte"
import { RasterLayerProperties } from "../../Models/RasterLayerProperties"
import * as htmltoimage from "html-to-image"

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
    readonly allowRotating: UIEventSource<true | boolean | undefined>
    readonly allowZooming: UIEventSource<true | boolean | undefined>
    readonly lastClickLocation: Store<undefined | { lon: number; lat: number }>
    readonly minzoom: UIEventSource<number>
    readonly maxzoom: UIEventSource<number>
    private readonly _maplibreMap: Store<MLMap>
    /**
     * Used for internal bookkeeping (to remove a rasterLayer when done loading)
     * @private
     */
    private _currentRasterLayer: string

    constructor(maplibreMap: Store<MLMap>, state?: Partial<MapProperties>) {
        this._maplibreMap = maplibreMap

        this.location = state?.location ?? new UIEventSource(undefined)
        if (this.location.data) {
            // The MapLibre adaptor updates the element in the location and then pings them
            // Often, code setting this up doesn't expect the object they pass in to be changed, so we create a copy
            this.location.setData({ ...this.location.data })
        }
        this.zoom = state?.zoom ?? new UIEventSource(1)
        this.minzoom = state?.minzoom ?? new UIEventSource(0)
        this.maxzoom = state?.maxzoom ?? new UIEventSource(24)
        this.zoom.addCallbackAndRunD((z) => {
            if (z < this.minzoom.data) {
                this.zoom.setData(this.minzoom.data)
            }
            const max = Math.min(24, this.maxzoom.data ?? 24)
            if (z > max) {
                this.zoom.setData(max)
            }
        })
        this.maxbounds = state?.maxbounds ?? new UIEventSource(undefined)
        this.allowMoving = state?.allowMoving ?? new UIEventSource(true)
        this.allowRotating = state?.allowRotating ?? new UIEventSource<boolean>(true)
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
            const lon = e.lngLat.lng
            const lat = e.lngLat.lat
            lastClickLocation.setData({ lon, lat })
        }

        maplibreMap.addCallbackAndRunD((map) => {
            map.on("load", () => {
                map.resize()
                self.MoveMapToCurrentLoc(self.location.data)
                self.SetZoom(self.zoom.data)
                self.setMaxBounds(self.maxbounds.data)
                self.setAllowMoving(self.allowMoving.data)
                self.setAllowRotating(self.allowRotating.data)
                self.setAllowZooming(self.allowZooming.data)
                self.setMinzoom(self.minzoom.data)
                self.setMaxzoom(self.maxzoom.data)
                self.setBounds(self.bounds.data)
                self.setBackground()
                this.updateStores(true)
            })
            map.resize()
            self.MoveMapToCurrentLoc(self.location.data)
            self.SetZoom(self.zoom.data)
            self.setMaxBounds(self.maxbounds.data)
            self.setAllowMoving(self.allowMoving.data)
            self.setAllowRotating(self.allowRotating.data)
            self.setAllowZooming(self.allowZooming.data)
            self.setMinzoom(self.minzoom.data)
            self.setMaxzoom(self.maxzoom.data)
            self.setBounds(self.bounds.data)
            self.setBackground()
            this.updateStores(true)
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

        this.rasterLayer.addCallbackAndRun((_) =>
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
        this.allowRotating.addCallbackAndRunD((allowRotating) =>
            self.setAllowRotating(allowRotating)
        )
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

    public static prepareWmsSource(layer: RasterLayerProperties): SourceSpecification {
        return {
            type: "raster",
            // use the tiles option to specify a 256WMS tile source URL
            // https://maplibre.org/maplibre-gl-js-docs/style-spec/sources/
            tiles: [MapLibreAdaptor.prepareWmsURL(layer.url, layer["tile-size"] ?? 256)],
            tileSize: layer["tile-size"] ?? 256,
            minzoom: layer["min_zoom"] ?? 1,
            maxzoom: layer["max_zoom"] ?? 25,
            // Bit of a hack, but seems to work
            scheme: layer.url.includes("{-y}") ? "tms" : "xyz",
        }
    }

    public static setDpi(
        drawOn: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
        dpiFactor: number
    ) {
        drawOn.style.width = drawOn.style.width || drawOn.width + "px"
        drawOn.style.height = drawOn.style.height || drawOn.height + "px"

        // Resize canvas and scale future draws.
        drawOn.width = Math.ceil(drawOn.width * dpiFactor)
        drawOn.height = Math.ceil(drawOn.height * dpiFactor)
        ctx.scale(dpiFactor, dpiFactor)
    }

    /**
     * Prepares an ELI-URL to be compatible with mapbox
     */
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

    public async exportAsPng(markerScale: number = 1): Promise<Blob> {
        const map = this._maplibreMap.data
        if (!map) {
            return undefined
        }
        const drawOn = document.createElement("canvas")
        drawOn.width = map.getCanvas().width
        drawOn.height = map.getCanvas().height

        const ctx = drawOn.getContext("2d")
        // Set up CSS size.
        MapLibreAdaptor.setDpi(drawOn, ctx, markerScale / map.getPixelRatio())

        await this.exportBackgroundOnCanvas(ctx)

        // MapLibreAdaptor.setDpi(drawOn, ctx, 1)
        await this.drawMarkers(markerScale, ctx)
        ctx.scale(markerScale, markerScale)
        this._maplibreMap.data?.resize()

        return await new Promise<Blob>((resolve) => drawOn.toBlob((blob) => resolve(blob)))
    }

    /**
     * Exports the background map and lines to PNG.
     * Markers are _not_ rendered
     */
    private async exportBackgroundOnCanvas(ctx: CanvasRenderingContext2D): Promise<void> {
        const map = this._maplibreMap.data
        // We draw the maplibre-map onto the canvas. This does not export markers
        // Inspiration by https://github.com/mapbox/mapbox-gl-js/issues/2766

        // Total hack - see https://stackoverflow.com/questions/42483449/mapbox-gl-js-export-map-to-png-or-pdf
        const promise = new Promise<void>((resolve) => {
            map.once("render", () => {
                ctx.drawImage(map.getCanvas(), 0, 0)
                resolve()
            })
        })

        while (!map.isStyleLoaded()) {
            console.log("Waiting to fully load the style...")
            await Utils.waitFor(100)
        }
        map.triggerRepaint()
        await promise
        map.resize()
    }

    private async drawMarkers(dpiFactor: number, drawOn: CanvasRenderingContext2D): Promise<void> {
        const map = this._maplibreMap.data
        if (!map) {
            return undefined
        }
        map.getCanvas().style.display = "none"

        const width = map.getCanvas().width
        const height = map.getCanvas().height
        const container = map.getContainer()
        function isDisplayed(el: Element) {
            const r1 = el.getBoundingClientRect()
            const r2 = container.getBoundingClientRect()
            return !(
                r2.left > r1.right ||
                r2.right < r1.left ||
                r2.top > r1.bottom ||
                r2.bottom < r1.top
            )
        }
        const markers = Array.from(container.getElementsByClassName("marker"))
        for (let i = 0; i < markers.length; i++) {
            const marker = markers[i]
            if (!isDisplayed(marker)) {
                continue
            }
            const markerRect = marker.getBoundingClientRect()
            const w = markerRect.width
            const h = markerRect.height
            console.log("Drawing marker", i, "/", markers.length, marker)
            const markerImg = await htmltoimage.toCanvas(<HTMLElement>marker, {
                pixelRatio: dpiFactor,
                canvasWidth: width * dpiFactor,
                canvasHeight: height * dpiFactor,
                width: width,
                height: height,
            })

            try {
                drawOn.drawImage(markerImg, markerRect.x, markerRect.y)
            } catch (e) {
                console.log("Could not draw image because of", e)
            }
        }

        map.getCanvas().style.display = "unset"
    }

    private updateStores(isSetup: boolean = false): void {
        const map = this._maplibreMap.data
        if (!map) {
            return
        }
        const { lng, lat } = map.getCenter()
        if (lng === 0 && lat === 0) {
            return
        }
        if (this.location.data === undefined) {
            this.location.setData({ lon: lng, lat })
        } else if (!isSetup) {
            const lon = map.getCenter().lng
            const lat = map.getCenter().lat
            this.location.setData({ lon, lat })
        }
        this.zoom.setData(Math.round(map.getZoom() * 10) / 10)
        const bounds = map.getBounds()
        const bbox = new BBox([
            [bounds.getEast(), bounds.getNorth()],
            [bounds.getWest(), bounds.getSouth()],
        ])
        if (this.bounds.data === undefined || !isSetup) {
            this.bounds.setData(bbox)
        }
    }

    private SetZoom(z: number): void {
        const map = this._maplibreMap.data
        if (!map || z === undefined) {
            return
        }
        if (Math.abs(map.getZoom() - z) > 0.01) {
            map.setZoom(z)
        }
    }

    private MoveMapToCurrentLoc(loc: { lat: number; lon: number }): void {
        const map = this._maplibreMap.data
        if (!map || loc === undefined) {
            return
        }

        const center = map.getCenter()
        if (center.lng !== loc.lon || center.lat !== loc.lat) {
            if (isNaN(loc.lon) || isNaN(loc.lat)) {
                console.error("Got invalid lat or lon, not setting")
            } else {
                map.setCenter({ lng: loc.lon, lat: loc.lat })
            }
        }
    }

    private async awaitStyleIsLoaded(): Promise<void> {
        const map = this._maplibreMap.data
        if (!map) {
            return
        }
        while (!map?.isStyleLoaded()) {
            await Utils.waitFor(250)
        }
    }

    private removeCurrentLayer(map: MLMap): void {
        if (this._currentRasterLayer) {
            // hide the previous layer
            try {
                if (map.getLayer(this._currentRasterLayer)) {
                    map.removeLayer(this._currentRasterLayer)
                }
                if (map.getSource(this._currentRasterLayer)) {
                    map.removeSource(this._currentRasterLayer)
                }
                this._currentRasterLayer = undefined
            } catch (e) {
                console.warn("Could not remove the previous layer")
            }
        }
    }

    private async setBackground(): Promise<void> {
        const map = this._maplibreMap.data
        if (!map) {
            return
        }
        const background: RasterLayerProperties = this.rasterLayer?.data?.properties
        if (!background) {
            return
        }
        if (this._currentRasterLayer === background.id) {
            // already the correct background layer, nothing to do
            return
        }

        if (!background?.url) {
            // no background to set
            this.removeCurrentLayer(map)
            return
        }

        if (background.type === "vector") {
            this.removeCurrentLayer(map)
            map.setStyle(background.url)
            return
        }

        let addLayerBeforeId = "aeroway_fill" // this is the first non-landuse item in the stylesheet, we add the raster layer before the roads but above the landuse
        if (background.category === "osmbasedmap" || background.category === "map") {
            // The background layer is already an OSM-based map or another map, so we don't want anything from the baselayer
            addLayerBeforeId = undefined
            this.removeCurrentLayer(map)
        } else {
            // Make sure that the default maptiler style is loaded as it gives an overlay with roads
            const maptiler = AvailableRasterLayers.maptilerDefaultLayer.properties
            if (!map.getSource(maptiler.id)) {
                this.removeCurrentLayer(map)
                map.addSource(maptiler.id, MapLibreAdaptor.prepareWmsSource(maptiler))
                map.setStyle(maptiler.url)
                await this.awaitStyleIsLoaded()
            }
        }

        if (!map.getLayer(addLayerBeforeId)) {
            addLayerBeforeId = undefined
        }
        await this.awaitStyleIsLoaded()
        if (!map.getSource(background.id)) {
            map.addSource(background.id, MapLibreAdaptor.prepareWmsSource(background))
        }
        if (!map.getLayer(background.id)) {
            addLayerBeforeId ??= map
                .getStyle()
                .layers.find((l) => l.id.startsWith("mapcomplete_"))?.id
            console.log(
                "Adding background layer",
                background.id,
                "beforeId",
                addLayerBeforeId,
                "; all layers are",
                map.getStyle().layers.map((l) => l.id)
            )
            map.addLayer(
                {
                    id: background.id,
                    type: "raster",
                    source: background.id,
                    paint: {},
                },
                addLayerBeforeId
            )
        }
        await this.awaitStyleIsLoaded()
        if (this._currentRasterLayer !== background?.id) {
            this.removeCurrentLayer(map)
        }
        this._currentRasterLayer = background?.id
    }

    private setMaxBounds(bbox: undefined | BBox) {
        const map = this._maplibreMap.data
        if (!map) {
            return
        }
        if (bbox) {
            map?.setMaxBounds(bbox.toLngLat())
        } else {
            map?.setMaxBounds(null)
        }
    }

    private setAllowRotating(allow: true | boolean | undefined) {
        const map = this._maplibreMap.data
        if (!map) {
            return
        }
        if (allow === false) {
            map.rotateTo(0, { duration: 0 })
            map.setPitch(0)
            map.dragRotate.disable()
            map.touchZoomRotate.disableRotation()
        } else {
            map.dragRotate.enable()
            map.touchZoomRotate.enableRotation()
        }
    }

    private setAllowMoving(allow: true | boolean | undefined) {
        const map = this._maplibreMap.data
        if (!map) {
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
        this.setAllowRotating(this.allowRotating.data)
    }

    private setMinzoom(minzoom: number) {
        const map = this._maplibreMap.data
        if (!map) {
            return
        }
        map.setMinZoom(minzoom)
    }

    private setMaxzoom(maxzoom: number) {
        const map = this._maplibreMap.data
        if (!map) {
            return
        }
        map.setMaxZoom(maxzoom)
    }

    private setAllowZooming(allow: true | boolean | undefined) {
        const map = this._maplibreMap.data
        if (!map) {
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
        if (!map || bounds === undefined) {
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
