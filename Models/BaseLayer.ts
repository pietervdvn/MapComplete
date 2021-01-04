import {TileLayer} from "leaflet";

export default interface BaseLayer {
    id: string,
    name: string,
    layer: TileLayer,
    max_zoom: number,
    min_zoom: number;
    feature: any,
}