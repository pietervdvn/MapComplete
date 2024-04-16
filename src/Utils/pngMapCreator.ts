import ThemeViewState from "../Models/ThemeViewState"
import { Utils } from "../Utils"
import { UIEventSource } from "../Logic/UIEventSource"
import { Map as MlMap } from "maplibre-gl"
import { MapLibreAdaptor } from "../UI/Map/MapLibreAdaptor"
import { AvailableRasterLayers } from "../Models/RasterLayers"

export interface PngMapCreatorOptions {
    /**
     * In mm
     */
    readonly width: number
    /**
     * In mm
     */
    readonly height: number
}

export class PngMapCreator {
    private static id = 0
    private readonly _options: PngMapCreatorOptions
    private readonly _state: ThemeViewState

    constructor(state: ThemeViewState, options: PngMapCreatorOptions) {
        this._state = state
        this._options = options
    }

    /**
     * Creates a base64-encoded PNG image
     * @constructor
     */
    public async CreatePng(freeComponentId: string, status?: UIEventSource<string>): Promise<Blob> {
        const div = document.createElement("div")
        div.id = "mapdiv-" + PngMapCreator.id

        /**
         * We want a certain amount of pixels per mm² for a high print quality
         * For this, we create a bigger map on the screen with a canvas, which has a pixelratio given
         *
         * We know that the default DPI of a canvas is 92, but to print something, we need a bit more
         * So, instead, we give it PIXELRATIO more mm and let it render.
         * We then draw this onto the PDF as if it were smaller, so it'll have plenty of quality there.
         *
         * However, we also need to compensate for this in the zoom level
         *
         */

        const pixelRatio = 2 // dots per mm
        div.style.width = this._options.width + "mm"
        div.style.height = this._options.height + "mm"

        PngMapCreator.id++
        try {
            const layout = this._state.layout

            function setState(msg: string) {
                status?.setData(layout.id + ": " + msg)
            }

            setState("Initializing map")

            const settings = this._state.mapProperties
            const l = settings.location.data

            document.getElementById(freeComponentId).appendChild(div)
            const newZoom = settings.zoom.data + Math.log2(pixelRatio) - 1
            const rasterLayerProperties =
                settings.rasterLayer.data?.properties ??
                AvailableRasterLayers.defaultBackgroundLayer.properties
            const style = rasterLayerProperties?.style ?? rasterLayerProperties?.url
            const mapElem = new MlMap({
                container: div.id,
                style,
                center: [l.lon, l.lat],
                zoom: newZoom,
                pixelRatio,
            })

            console.log("Creating a map with size", this._options.width, this._options.height)

            const map = new UIEventSource<MlMap>(mapElem)
            const mla = new MapLibreAdaptor(map)
            mla.zoom.setData(newZoom)
            mla.location.setData(settings.location.data)
            mla.rasterLayer.setData(settings.rasterLayer.data)
            mla.allowZooming.setData(false)
            mla.allowMoving.setData(false)

            setState("Waiting for the data")
            this._state?.showNormalDataOn(map)
            setState("Waiting for the data")

            await this._state.dataIsLoading.AsPromise((loading) => !loading)
            setState("Waiting for styles to be fully loaded")
            while (!map?.data?.isStyleLoaded()) {
                console.log("Waiting for the style to be loaded...")
                await Utils.waitFor(250)
            }

            // Some extra buffer...
            for (let i = 0; i < 5; i++) {
                setState(5 - i + " seconds pause to make sure all images are loaded...")
                await Utils.waitFor(1000)
            }
            setState(
                "Exporting png (" +
                    this._options.width +
                    "mm * " +
                    this._options.height +
                    "mm , maplibre-canvas-pixelratio: " +
                    pixelRatio +
                    ")"
            )
            const progress = new UIEventSource<{ current: number; total: number }>(undefined)
            progress.addCallbackD(({ current, total }) => {
                setState(`Rendering marker ${current}/${total}`)
            })
            const png = await mla.exportAsPng(pixelRatio, progress)
            setState("Offering as download...")
            return png
        } finally {
            div.parentElement.removeChild(div)
        }
    }
}
