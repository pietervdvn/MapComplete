import {TileLayer} from "leaflet";

export interface BaseLayer {
    id: string,
    name: string,
    layer: TileLayer,
    max_zoom: number,
    min_zoom: number;
    feature: any,
}