import { Store, UIEventSource } from "../Logic/UIEventSource"
import { BBox } from "../Logic/BBox"
import { RasterLayerPolygon } from "./RasterLayers"

export interface MapProperties {
    readonly location: UIEventSource<{ lon: number; lat: number }>
    readonly zoom: UIEventSource<number>
    readonly minzoom: UIEventSource<number>
    readonly maxzoom: UIEventSource<number>
    readonly bounds: UIEventSource<BBox>
    readonly rasterLayer: UIEventSource<RasterLayerPolygon | undefined>
    readonly maxbounds: UIEventSource<undefined | BBox>
    readonly allowMoving: UIEventSource<true | boolean>
    readonly allowRotating: UIEventSource<true | boolean>
    readonly lastClickLocation: Store<{ lon: number; lat: number }>
    readonly allowZooming: UIEventSource<true | boolean>
}

export interface ExportableMap {
    /**
     * Export the current map as PNG.
     * @param markerScale: if given, the markers will be 'markerScale' bigger. This is to use in combination with a supersized canvas to have more pixels and achieve print quality
     */
    exportAsPng(markerScale?: number): Promise<Blob>
}
