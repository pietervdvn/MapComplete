import ThemeViewState from "../Models/ThemeViewState"
import SvelteUIElement from "../UI/Base/SvelteUIElement"
import MaplibreMap from "../UI/Map/MaplibreMap.svelte"
import { Utils } from "../Utils"
import { UIEventSource } from "../Logic/UIEventSource"

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
    public async CreatePng(status: UIEventSource<string>): Promise<Blob> {
        const div = document.createElement("div")
        div.id = "mapdiv-" + PngMapCreator.id
        PngMapCreator.id++
        const layout = this._state.layout
        function setState(msg: string) {
            status.setData(layout.id + ": " + msg)
        }
        setState("Initializing map")
        const map = this._state.map
        new SvelteUIElement(MaplibreMap, { map })
            .SetStyle(
                "width: " + this._options.width + "mm; height: " + this._options.height + "mm"
            )
            .AttachTo("extradiv")
        setState("Waiting for the data")
        await this._state.dataIsLoading.AsPromise((loading) => !loading)
        setState("Waiting for styles to be fully loaded")
        while (!map?.data?.isStyleLoaded()) {
            await Utils.waitFor(250)
        }
        // Some extra buffer...
        await Utils.waitFor(1000)
        setState("Exporting png")
        console.log("Loading for", this._state.layout.id, "is done")
        return this._state.mapProperties.exportAsPng()
    }
}
