import { Store, UIEventSource } from "../Logic/UIEventSource"
import { BBox } from "../Logic/BBox"
import { RasterLayerPolygon } from "./RasterLayers"
import { Feature } from "geojson"

export interface KeyNavigationEvent {
    date: Date
    key: "north" | "east" | "south" | "west" | "in" | "out" | "islocked" | "locked" | "unlocked"
}

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
    readonly rotation: UIEventSource<number>
    readonly pitch: UIEventSource<number>
    readonly lastClickLocation: Store<{
        lon: number
        lat: number
        /**
         * The nearest feature from a MapComplete layer
         */
        nearestFeature?: Feature
    }>
    readonly allowZooming: UIEventSource<true | boolean>
    readonly useTerrain: Store<boolean>
    readonly showScale: UIEventSource<boolean>

    /**
     * Triggered when the user navigated by using the keyboard.
     * The callback might return 'true' if it wants to be unregistered
     * @param f
     */
    onKeyNavigationEvent(f: (event: KeyNavigationEvent) => void | boolean): () => void

    flyTo(lon: number, lat: number, zoom: number): void
}

export interface ExportableMap {
    /**
     * Export the current map as PNG.
     * @param markerScale: if given, the markers will be 'markerScale' bigger. This is to use in combination with a supersized canvas to have more pixels and achieve print quality
     */
    exportAsPng(markerScale?: number): Promise<Blob>
}
