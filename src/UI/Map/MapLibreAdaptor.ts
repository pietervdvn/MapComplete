import { ImmutableStore, Store, UIEventSource } from "../../Logic/UIEventSource"
import { Map as MLMap } from "maplibre-gl"
import { Map as MlMap, SourceSpecification } from "maplibre-gl"
import maplibregl from "maplibre-gl"
import { RasterLayerPolygon } from "../../Models/RasterLayers"
import { Utils } from "../../Utils"
import { BBox } from "../../Logic/BBox"
import { ExportableMap, KeyNavigationEvent, MapProperties } from "../../Models/MapProperties"
import SvelteUIElement from "../Base/SvelteUIElement"
import MaplibreMap from "./MaplibreMap.svelte"
import { RasterLayerProperties } from "../../Models/RasterLayerProperties"
import * as htmltoimage from "html-to-image"
import RasterLayerHandler from "./RasterLayerHandler"
import Constants from "../../Models/Constants"
import { Protocol } from "pmtiles"
import { bool } from "sharp"

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
    readonly rotation: UIEventSource<number>
    readonly pitch: UIEventSource<number>
    readonly useTerrain: Store<boolean>

    private static pmtilesInited = false
    /**
     * Functions that are called when one of those actions has happened
     * @private
     */
    private _onKeyNavigation: ((event: KeyNavigationEvent) => void | boolean)[] = []

    private readonly _maplibreMap: Store<MLMap>

    constructor(maplibreMap: Store<MLMap>, state?: Partial<MapProperties>) {
        if (!MapLibreAdaptor.pmtilesInited) {
            maplibregl.addProtocol("pmtiles", new Protocol().tile)
            MapLibreAdaptor.pmtilesInited = true
            console.log("PM-tiles protocol added" + "")
        }
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
        this.rotation = state?.rotation ?? new UIEventSource<number>(0)
        this.pitch = state?.pitch ?? new UIEventSource<number>(0)
        this.useTerrain = state?.useTerrain ?? new ImmutableStore<boolean>(false)
        this.rasterLayer =
            state?.rasterLayer ?? new UIEventSource<RasterLayerPolygon | undefined>(undefined)

        const lastClickLocation = new UIEventSource<{ lon: number; lat: number }>(undefined)
        this.lastClickLocation = lastClickLocation
        const self = this

        new RasterLayerHandler(this._maplibreMap, this.rasterLayer)

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
                self.setTerrain(self.useTerrain.data)
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
            self.SetRotation(self.rotation.data)
            self.setTerrain(self.useTerrain.data)
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
            map.on("rotateend", (_) => {
                this.updateStores()
            })
            map.on("pitchend", () => {
                this.updateStores()
            })
            map.getContainer().addEventListener("keydown", (event) => {
                let locked: "islocked" = undefined
                if (!this.allowMoving.data) {
                    locked = "islocked"
                }
                switch (event.key) {
                    case "ArrowUp":
                        this.pingKeycodeEvent(locked ?? "north")
                        break
                    case "ArrowRight":
                        this.pingKeycodeEvent(locked ?? "east")
                        break
                    case "ArrowDown":
                        this.pingKeycodeEvent(locked ?? "south")
                        break
                    case "ArrowLeft":
                        this.pingKeycodeEvent(locked ?? "west")
                        break
                    case "+":
                        this.pingKeycodeEvent("in")
                        break
                    case "=":
                        this.pingKeycodeEvent("in")
                        break
                    case "-":
                        this.pingKeycodeEvent("out")
                        break
                }
            })
        })

        this.location.addCallbackAndRunD((loc) => {
            self.MoveMapToCurrentLoc(loc)
        })
        this.zoom.addCallbackAndRunD((z) => self.SetZoom(z))
        this.maxbounds.addCallbackAndRun((bbox) => self.setMaxBounds(bbox))
        this.rotation.addCallbackAndRunD((bearing) => self.SetRotation(bearing))
        this.allowMoving.addCallbackAndRun((allowMoving) => {
            self.setAllowMoving(allowMoving)
            self.pingKeycodeEvent(allowMoving ? "unlocked" : "locked")
        })
        this.allowRotating.addCallbackAndRunD((allowRotating) =>
            self.setAllowRotating(allowRotating)
        )
        this.allowZooming.addCallbackAndRun((allowZooming) => self.setAllowZooming(allowZooming))
        this.bounds.addCallbackAndRunD((bounds) => self.setBounds(bounds))
        this.useTerrain?.addCallbackAndRun((useTerrain) => self.setTerrain(useTerrain))
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
        return RasterLayerHandler.prepareSource(layer)
    }

    /**
     * Prepares an ELI-URL to be compatible with mapbox
     */

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

    public onKeyNavigationEvent(f: (event: KeyNavigationEvent) => void | boolean) {
        this._onKeyNavigation.push(f)
        return () => {
            this._onKeyNavigation.splice(this._onKeyNavigation.indexOf(f), 1)
        }
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

        const dpi = map.getPixelRatio()
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

    private pingKeycodeEvent(
        key: "north" | "east" | "south" | "west" | "in" | "out" | "islocked" | "locked" | "unlocked"
    ) {
        const event = {
            date: new Date(),
            key: key,
        }

        for (let i = 0; i < this._onKeyNavigation.length; i++) {
            const f = this._onKeyNavigation[i]
            const unregister = f(event)
            if (unregister === true) {
                this._onKeyNavigation.splice(i, 1)
                i--
            }
        }
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
        {
            const allimages = element.getElementsByTagName("img")
            for (const img of Array.from(allimages)) {
                let isLoaded: boolean = false
                while (!isLoaded) {
                    console.log(
                        "Waiting for image",
                        img.src,
                        "to load",
                        img.complete,
                        img.naturalWidth,
                        img
                    )
                    await Utils.waitFor(250)
                    isLoaded = img.complete && img.width > 0
                }
            }
        }

        const style = element.style.transform
        let x = element.getBoundingClientRect().x
        let y = element.getBoundingClientRect().y
        element.style.transform = ""
        const offset = style.match(/translate\(([-0-9]+)%, ?([-0-9]+)%\)/)

        let labels = <HTMLElement[]>Array.from(element.getElementsByClassName("marker-label"))
        const origLabelTransforms = labels.map((l) => l.style.transform)
        // We save the original width (`w`) and height (`h`) in order to restore them later on
        const w = element.style.width
        const h = Number(element.style.height)
        const targetW = Math.max(
            element.getBoundingClientRect().width * 4,
            ...labels.map((l) => l.getBoundingClientRect().width)
        )
        const targetH =
            element.getBoundingClientRect().height +
            Math.max(
                ...labels.map(
                    (l) =>
                        l.getBoundingClientRect().height *
                        2 /* A bit of buffer to catch eventual 'margin-top'*/
                )
            )

        // Force a wider view for icon badges
        element.style.width = targetW + "px"
        // Force more height to include labels
        element.style.height = targetH + "px"
        element.classList.add("w-full", "flex", "flex-col", "items-center")
        labels.forEach((l) => {
            l.style.transform = ""
        })
        await Utils.awaitAnimationFrame()
        const svgSource = await htmltoimage.toSvg(element)
        const img = await MapLibreAdaptor.createImage(svgSource)
        for (let i = 0; i < labels.length; i++) {
            labels[i].style.transform = origLabelTransforms[i]
        }
        element.style.width = "" + w
        element.style.height = "" + h

        if (offset && rescaleIcons !== 1) {
            const [_, __, relYStr] = offset
            const relY = Number(relYStr)
            y += img.height * (relY / 100)
        }

        x *= pixelRatio
        y *= pixelRatio

        try {
            const xdiff = (img.width * rescaleIcons) / 2
            drawOn.drawImage(img, x - xdiff, y, img.width * rescaleIcons, img.height * rescaleIcons)
        } catch (e) {
            console.log("Could not draw image because of", e)
        }
        element.classList.remove("w-full", "flex", "flex-col", "items-center")
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
            const style = marker.style.transform

            if (isDisplayed(marker)) {
                await this.drawElement(drawOn, marker, rescaleIcons, pixelRatio)
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
        this.rotation.setData(map.getBearing())
        this.pitch.setData(map.getPitch())
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

    private SetRotation(bearing: number): void {
        const map = this._maplibreMap.data
        if (!map || bearing === undefined) {
            return
        }
        map.rotateTo(bearing, { duration: 0 })
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

    public installCustomKeyboardHandler(viewportStore: UIEventSource<HTMLDivElement>) {
        viewportStore.mapD(
            (viewport) => {
                const map = this._maplibreMap.data
                if (!map) {
                    return
                }
                const oldKeyboard = map.keyboard
                const w = viewport.getBoundingClientRect().width
                if (w < 10) {
                    /// this is weird, but definitively wrong!
                    console.log("Got a very small bound", w, viewport)
                    // We try again later on
                    window.requestAnimationFrame(() => {
                        viewportStore.ping()
                    })
                    return
                }
                oldKeyboard._panStep = w
            },
            [this._maplibreMap]
        )
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
            map.keyboard.disableRotation()
            map.touchZoomRotate.disableRotation()
        } else {
            map.dragRotate.enable()
            map.keyboard.enableRotation()
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

    private async setTerrain(useTerrain: boolean) {
        const map = this._maplibreMap.data
        if (!map) {
            return
        }
        const id = "maptiler-terrain-data"
        if (useTerrain) {
            if (map.getTerrain()) {
                return
            }
            map.addSource(id, {
                type: "raster-dem",
                url:
                    "https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=" +
                    Constants.maptilerApiKey,
            })
            try {
                while (!map?.isStyleLoaded()) {
                    await Utils.waitFor(250)
                }
                map.setTerrain({
                    source: id,
                })
            } catch (e) {
                console.error(e)
            }
        }
    }
}
