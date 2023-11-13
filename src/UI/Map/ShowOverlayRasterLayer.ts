import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { Map as MlMap } from "maplibre-gl"
import { Utils } from "../../Utils"
import { MapLibreAdaptor } from "./MapLibreAdaptor"
import { RasterLayerProperties } from "../../Models/RasterLayerProperties"

export default class ShowOverlayRasterLayer {
    private readonly _map: UIEventSource<MlMap>
    private readonly _layer: RasterLayerProperties
    private readonly _mapProperties?: { zoom: Store<number> }
    private _mllayer
    private readonly _isDisplayed?: Store<boolean>

    constructor(
        layer: RasterLayerProperties,
        map: UIEventSource<MlMap>,
        mapProperties?: { zoom: Store<number> },
        options?: {
            isDisplayed?: Store<boolean>
        }
    ) {
        this._mapProperties = mapProperties
        this._layer = layer
        this._map = map
        this._isDisplayed = options?.isDisplayed
        const self = this
        map.addCallbackAndRunD((map) => {
            self.addLayer()
            map.on("load", () => {
                self.addLayer()
            })
        })
        this.addLayer()

        options?.isDisplayed?.addCallbackAndRun(() => {
            self.setVisibility()
        })

        mapProperties?.zoom?.addCallbackAndRun(() => {
            self.setVisibility()
        })
    }

    private setVisibility() {
        let zoom = this._mapProperties?.zoom?.data
        let withinRange = zoom === undefined || zoom > this._layer.min_zoom
        let isDisplayed = (this._isDisplayed?.data ?? true) && withinRange
        try {
            this._map.data?.setLayoutProperty(
                this._layer.id,
                "visibility",
                isDisplayed ? "visible" : "none"
            )
        } catch (e) {
            console.error(e)
        }
    }

    private async awaitStyleIsLoaded(): Promise<void> {
        const map = this._map.data
        if (map === undefined) {
            return
        }
        while (!map?.isStyleLoaded()) {
            await Utils.waitFor(250)
        }
    }

    private async addLayer() {
        const map = this._map.data
        console.log("Attempting to add ", this._layer.id)
        if (map === undefined) {
            return
        }
        await this.awaitStyleIsLoaded()
        if (this._mllayer) {
            // Already initialized
            return
        }
        const background: RasterLayerProperties = this._layer

        map.addSource(background.id, MapLibreAdaptor.prepareWmsSource(background))
        this._mllayer = map.addLayer({
            id: background.id,
            type: "raster",
            source: background.id,
            paint: {},
        })
        map.setLayoutProperty(
            this._layer.id,
            "visibility",
            this._isDisplayed?.data ?? true ? "visible" : "none"
        )
        this.setVisibility()
    }
}
