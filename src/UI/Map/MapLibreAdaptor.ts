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
    /**
     * When was the last navigation by arrow keys?
     * If set, this is a hint to use arrow compatibility
     * Number of _seconds_ since epoch
     */
    readonly lastKeyNavigation: UIEventSource<number> = new UIEventSource<number>(undefined)
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
            map.getContainer().addEventListener("keydown", (event) => {
                if (
                    event.key === "ArrowRight" ||
                    event.key === "ArrowLeft" ||
                    event.key === "ArrowUp" ||
                    event.key === "ArrowDown"
                ) {
                    this.lastKeyNavigation.setData(Date.now() / 1000)
                }
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

    private static async toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
        return await new Promise<Blob>((resolve) => canvas.toBlob((blob) => resolve(blob)))
    }

    private static async createImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.decode = () => resolve(img) as any
            img.onload = () => resolve(img)
            img.onerror = reject
            img.crossOrigin = "anonymous"
            img.decoding = "async"
            img.src = url
        })
    }

    public async exportAsPng(
        rescaleIcons: number = 1,
        progress: UIEventSource<{ current: number; total: number }> = undefined
    ): Promise<Blob> {
        const map = this._maplibreMap.data
        if (!map) {
            return undefined
        }
        const drawOn = document.createElement("canvas", {})
        const ctx = drawOn.getContext("2d")
        // The width/height has been set in 'mm' on the parent element and converted to pixels by the browser
        const w = map.getContainer().getBoundingClientRect().width
        const h = map.getContainer().getBoundingClientRect().height

        let dpi = map.getPixelRatio()
        // The 'css'-size stays constant...
        drawOn.style.width = w + "px"
        drawOn.style.height = h + "px"

        // ...but the number of pixels is increased
        drawOn.width = Math.ceil(w * dpi)
        drawOn.height = Math.ceil(h * dpi)

        await this.exportBackgroundOnCanvas(ctx)
        await this.drawMarkers(ctx, rescaleIcons, progress)
        return await MapLibreAdaptor.toBlob(drawOn)
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
    }

    private async drawElement(
        drawOn: CanvasRenderingContext2D,
        element: HTMLElement,
        rescaleIcons: number,
        pixelRatio: number
    ) {
        const style = element.style.transform
        let x = element.getBoundingClientRect().x
        let y = element.getBoundingClientRect().y
        element.style.transform = ""
        const offset = style.match(/translate\(([-0-9]+)%, ?([-0-9]+)%\)/)

        const w = element.style.width
        const h = element.style.height

        // Force a wider view for icon badges
        element.style.width = element.getBoundingClientRect().width * 4 + "px"
        element.style.height = element.getBoundingClientRect().height + "px"
        const svgSource = await htmltoimage.toSvg(element)
        const img = await MapLibreAdaptor.createImage(svgSource)
        element.style.width = w
        element.style.height = h

        if (offset && rescaleIcons !== 1) {
            const [_, __, relYStr] = offset
            const relY = Number(relYStr)
            y += img.height * (relY / 100)
        }

        x *= pixelRatio
        y *= pixelRatio

        try {
            drawOn.drawImage(img, x, y, img.width * rescaleIcons, img.height * rescaleIcons)
        } catch (e) {
            console.log("Could not draw image because of", e)
        }
    }

    /**
     * Draws the markers of the current map on the specified canvas.
     * The DPIfactor is used to calculate the correct position, whereas 'rescaleIcons' can be used to make the icons smaller
     */
    private async drawMarkers(
        drawOn: CanvasRenderingContext2D,
        rescaleIcons: number = 1,
        progress: UIEventSource<{ current: number; total: number }>
    ): Promise<void> {
        const map = this._maplibreMap.data
        if (!map) {
            console.error("There is no map to export from")
            return undefined
        }

        const container = map.getContainer()
        const pixelRatio = map.getPixelRatio()

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
            const marker = <HTMLElement>markers[i]
            const labels = Array.from(marker.getElementsByClassName("marker-label"))
            const style = marker.style.transform

            if (isDisplayed(marker)) {
                await this.drawElement(drawOn, marker, rescaleIcons, pixelRatio)
            }

            for (const label of labels) {
                if (isDisplayed(label)) {
                    console.log("Exporting label", label)
                    await this.drawElement(drawOn, <HTMLElement>label, rescaleIcons, pixelRatio)
                }
            }

            if (progress) {
                progress.setData({ current: i, total: markers.length })
            }

            marker.style.transform = style
        }
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
