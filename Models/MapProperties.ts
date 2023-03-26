import { Store, UIEventSource } from "../Logic/UIEventSource"
import { BBox } from "../Logic/BBox"
import { RasterLayerPolygon } from "./RasterLayers"

export interface MapProperties {
    readonly location: UIEventSource<{ lon: number; lat: number }>
    readonly zoom: UIEventSource<number>
    readonly bounds: Store<BBox>
    readonly rasterLayer: UIEventSource<RasterLayerPolygon | undefined>
    readonly maxbounds: UIEventSource<undefined | BBox>
    readonly allowMoving: UIEventSource<true | boolean>
}
