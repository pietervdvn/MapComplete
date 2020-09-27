import {TileLayer} from "leaflet";

export interface BaseLayer {
    id: string,
    name: string,
    attribution_url: string,
    layer: TileLayer,
    max_zoom: number,
    min_zoom: number;
    feature: any,
    attribution?: string
}