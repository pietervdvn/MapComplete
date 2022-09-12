import FeaturePipelineState from "../Logic/State/FeaturePipelineState";
import MinimapImplementation from "../UI/Base/MinimapImplementation";
import {UIEventSource} from "../Logic/UIEventSource";
import Loc from "../Models/Loc";
import ShowDataLayer from "../UI/ShowDataLayer/ShowDataLayer";
import {BBox} from "../Logic/BBox";
import Minimap from "../UI/Base/Minimap";

export class PngMapCreator {
    private readonly _state: FeaturePipelineState;
    private readonly _options: {
        readonly divId: string; readonly width: number; readonly height: number; readonly scaling?: 1 | number
    };

    constructor(state: FeaturePipelineState, options: {
        readonly divId: string
        readonly width: number,
        readonly height: number,
        readonly scaling?: 1 | number
    }) {
        this._state = state;
        this._options = {...options, scaling: options.scaling ?? 1};
    }

    /**
     * Creates a minimap, waits till all needed tiles are loaded before returning
     * @private
     */
    private async createAndLoadMinimap(): Promise<MinimapImplementation> {
        const state = this._state;
        const options = this._options
        return new Promise(resolve => {
            const minimap = Minimap.createMiniMap({
                location: new UIEventSource<Loc>(state.locationControl.data), // We remove the link between the old and the new UI-event source as moving the map while the export is running fucks up the screenshot
                background: state.backgroundLayer,
                allowMoving: false,
                onFullyLoaded: (_) =>
                    window.setTimeout(() => {
                        resolve(<MinimapImplementation>minimap)
                    }, 250)
            })
            const style = `width: ${options.width * options.scaling}mm; height: ${options.height * options.scaling}mm;`
            console.log("Style is", style)
            minimap.SetStyle(style)
            minimap.AttachTo(options.divId)
        })

    }

    /**
     * Creates a base64-encoded PNG image
     * @constructor
     */
    public async CreatePng(format: "image" ): Promise<string > ;
    public async CreatePng(format: "blob"): Promise<Blob> ;
    public async CreatePng(format: "image" | "blob"): Promise<string | Blob>;
    public async CreatePng(format: "image" | "blob"): Promise<string | Blob> {

        // Lets first init the minimap and wait for all background tiles to load
        const minimap = await this.createAndLoadMinimap()
        const state = this._state

        return new Promise<string | Blob>(resolve => {
            // Next: we prepare the features. Only fully contained features are shown
            minimap.leafletMap.addCallbackAndRunD(async (leaflet) => {
                const bounds = BBox.fromLeafletBounds(leaflet.getBounds().pad(0.2))
                // Ping the featurepipeline to download what is needed
                state.currentBounds.setData(bounds)
                if(state.featurePipeline.runningQuery.data){
                    // A query is running!
                    // Let's wait for it to complete
                    console.log("Waiting for the query to complete")
                    await state.featurePipeline.runningQuery.AsPromise()
                }

                window.setTimeout(() => {


                    state.featurePipeline.GetTilesPerLayerWithin(bounds, (tile) => {

                        if (tile.layer.layerDef.minzoom > state.locationControl.data.zoom) {
                            return
                        }
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
                    minimap.TakeScreenshot(format).then(result => resolve(result))
                }, 2500)
            })
            state.AddAllOverlaysToMap(minimap.leafletMap)
        })
    }
}
