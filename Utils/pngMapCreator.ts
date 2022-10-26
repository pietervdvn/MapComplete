import FeaturePipelineState from "../Logic/State/FeaturePipelineState"
import MinimapImplementation from "../UI/Base/MinimapImplementation"
import { UIEventSource } from "../Logic/UIEventSource"
import Loc from "../Models/Loc"
import ShowDataLayer from "../UI/ShowDataLayer/ShowDataLayer"
import { BBox } from "../Logic/BBox"
import Minimap from "../UI/Base/Minimap"
import AvailableBaseLayers from "../Logic/Actors/AvailableBaseLayers"
import { Utils } from "../Utils"

export interface PngMapCreatorOptions {
    readonly divId: string
    readonly width: number
    readonly height: number
    readonly scaling?: 1 | number
    readonly dummyMode?: boolean
}

export class PngMapCreator {
    private readonly _state: FeaturePipelineState | undefined
    private readonly _options: PngMapCreatorOptions

    constructor(state: FeaturePipelineState | undefined, options: PngMapCreatorOptions) {
        this._state = state
        this._options = { ...options, scaling: options.scaling ?? 1 }
    }

    /**
     * Creates a minimap, waits till all needed tiles are loaded before returning
     * @private
     */
    private async createAndLoadMinimap(): Promise<MinimapImplementation> {
        const state = this._state
        const options = this._options
        const baselayer =
            AvailableBaseLayers.layerOverview.find(
                (bl) => bl.id === state.layoutToUse.defaultBackgroundId
            ) ?? AvailableBaseLayers.osmCarto
        return new Promise((resolve) => {
            const minimap = Minimap.createMiniMap({
                location: new UIEventSource<Loc>(state.locationControl.data), // We remove the link between the old and the new UI-event source as moving the map while the export is running fucks up the screenshot
                background: new UIEventSource(baselayer),
                allowMoving: false,
                onFullyLoaded: (_) =>
                    window.setTimeout(() => {
                        resolve(<MinimapImplementation>minimap)
                    }, 250),
            })
            const style = `width: ${options.width * options.scaling}mm; height: ${
                options.height * options.scaling
            }mm;`
            minimap.SetStyle(style)
            minimap.AttachTo(options.divId)
        })
    }

    /**
     * Creates a base64-encoded PNG image
     * @constructor
     */
    public async CreatePng(format: "image"): Promise<string>
    public async CreatePng(format: "blob"): Promise<Blob>
    public async CreatePng(format: "image" | "blob"): Promise<string | Blob>
    public async CreatePng(format: "image" | "blob"): Promise<string | Blob> {
        // Lets first init the minimap and wait for all background tiles to load
        const minimap = await this.createAndLoadMinimap()
        const state = this._state
        const dummyMode = this._options.dummyMode ?? false
        return new Promise<string | Blob>((resolve, reject) => {
            // Next: we prepare the features. Only fully contained features are shown
            minimap.leafletMap.addCallbackAndRunD(async (leaflet) => {
                // Ping the featurepipeline to download what is needed
                if (dummyMode) {
                    console.warn("Dummy mode is active - not loading map layers")
                } else {
                    const bounds = BBox.fromLeafletBounds(
                        leaflet.getBounds().pad(0.1).pad(-state.layoutToUse.widenFactor)
                    )
                    state.currentBounds.setData(bounds)
                    if (!state.featurePipeline.sufficientlyZoomed.data) {
                        console.warn("Not sufficiently zoomed!")
                    }

                    if (state.featurePipeline.runningQuery.data) {
                        // A query is running!
                        // Let's wait for it to complete
                        console.log("Waiting for the query to complete")
                        await state.featurePipeline.runningQuery.AsPromise(
                            (isRunning) => !isRunning
                        )
                        console.log("Query has completeted!")
                    }

                    state.featurePipeline.GetTilesPerLayerWithin(bounds, (tile) => {
                        if (tile.layer.layerDef.id.startsWith("note_import")) {
                            // Don't export notes to import
                            return
                        }
                        new ShowDataLayer({
                            features: tile,
                            leafletMap: minimap.leafletMap,
                            layerToShow: tile.layer.layerDef,
                            doShowLayer: tile.layer.isDisplayed,
                            state: undefined,
                        })
                    })
                    await Utils.waitFor(2000)
                }
                minimap
                    .TakeScreenshot(format)
                    .then(async (result) => {
                        const divId = this._options.divId
                        await Utils.waitFor(250)
                        document
                            .getElementById(divId)
                            .removeChild(
                                /*Will fetch the cached htmlelement:*/ minimap.ConstructElement()
                            )
                        return resolve(result)
                    })
                    .catch((failreason) => {
                        console.error("Could no make a screenshot due to ", failreason)
                        reject(failreason)
                    })
            })

            state.AddAllOverlaysToMap(minimap.leafletMap)
        })
    }
}
