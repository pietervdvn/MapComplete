import ThemeViewState from "../Models/ThemeViewState"
import { Utils } from "../Utils"
import { UIEventSource } from "../Logic/UIEventSource"
import { Map as MlMap } from "maplibre-gl"
import { MapLibreAdaptor } from "../UI/Map/MapLibreAdaptor"
import { AvailableRasterLayers } from "../Models/RasterLayers"

export interface PngMapCreatorOptions {
    readonly width: number
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
            const pixelRatio = 4
            const mapElem = new MlMap({
                container: div.id,
                style: AvailableRasterLayers.maptilerDefaultLayer.properties.url,
                center: [l.lon, l.lat],
                zoom: settings.zoom.data,
                pixelRatio,
            })

            const map = new UIEventSource<MlMap>(mapElem)
            const mla = new MapLibreAdaptor(map)
            mla.zoom.setData(settings.zoom.data)
            mla.location.setData(settings.location.data)
            mla.rasterLayer.setData(settings.rasterLayer.data)
            mla.allowZooming.setData(false)
            mla.allowMoving.setData(false)

            this._state?.showNormalDataOn(map)
            console.log("Creating a map with size", this._options.width, this._options.height)

            setState("Waiting for the data")
            await this._state.dataIsLoading.AsPromise((loading) => !loading)
            setState("Waiting for styles to be fully loaded")
            while (!map?.data?.isStyleLoaded()) {
                console.log("Waiting for the style to be loaded...")
                await Utils.waitFor(250)
            }
            // Some extra buffer...
            setState("One second pause to make sure all images are loaded...")
            await Utils.waitFor(1000)
            setState(
                "Exporting png (" +
                    this._options.width +
                    "mm * " +
                    this._options.height +
                    "mm , maplibre-canvas-pixelratio: " +
                    pixelRatio +
                    ")"
            )
            return await mla.exportAsPng(pixelRatio)
        } finally {
            div.parentElement.removeChild(div)
        }
    }
}
