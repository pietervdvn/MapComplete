export default interface BaseLayer {
    id: string
    name: string
    layer: () => any /*leaflet.TileLayer - not importing as it breaks scripts*/
    max_zoom: number
    min_zoom: number
    feature: any
    isBest?: boolean
    category?: "map" | "osmbasedmap" | "photo" | "historicphoto" | string
}
