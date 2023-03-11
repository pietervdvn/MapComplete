import SvelteUIElement from "./UI/Base/SvelteUIElement"
import MaplibreMap from "./UI/Map/MaplibreMap.svelte"
import { Store, Stores, UIEventSource } from "./Logic/UIEventSource"
import { MapLibreAdaptor } from "./UI/Map/MapLibreAdaptor"
import {
    EditorLayerIndexProperties,
    RasterLayerPolygon,
    RasterLayerProperties,
} from "./Models/RasterLayers"
import type { Map as MlMap } from "maplibre-gl"
import { AvailableRasterLayers } from "./Models/RasterLayers"
import Loc from "./Models/Loc"
import { BBox } from "./Logic/BBox"
import { GeoOperations } from "./Logic/GeoOperations"
import RasterLayerPicker from "./UI/Map/RasterLayerPicker.svelte"
import BackgroundLayerResetter from "./Logic/Actors/BackgroundLayerResetter"

async function main() {
    const mlmap = new UIEventSource<MlMap>(undefined)
    const locationControl = new UIEventSource<Loc>({
        zoom: 14,
        lat: 51.1,
        lon: 3.1,
    })
    new SvelteUIElement(MaplibreMap, {
        map: mlmap,
    })
        .SetClass("border border-black")
        .SetStyle("height: 50vh; width: 90%; margin: 1%")
        .AttachTo("maindiv")
    const bg = new UIEventSource<RasterLayerPolygon>(undefined)
    new MapLibreAdaptor(mlmap, {
        backgroundLayer: bg,
        locationControl,
    })

    const availableLayersBboxes = Stores.ListStabilized(
        locationControl.mapD((loc) => {
            const lonlat: [number, number] = [loc.lon, loc.lat]
            return AvailableRasterLayers.EditorLayerIndex.filter((eliPolygon) =>
                BBox.get(eliPolygon).contains(lonlat)
            )
        })
    )
    const availableLayers: Store<RasterLayerPolygon[]> = Stores.ListStabilized(
        availableLayersBboxes.map((eliPolygons) => {
            const loc = locationControl.data
            const lonlat: [number, number] = [loc.lon, loc.lat]
            const matching: RasterLayerPolygon[] = eliPolygons.filter((eliPolygon) => {
                if (eliPolygon.geometry === null) {
                    return true // global ELI-layer
                }
                return GeoOperations.inside(lonlat, eliPolygon)
            })
            matching.unshift(AvailableRasterLayers.osmCarto)
            matching.push(...AvailableRasterLayers.globalLayers)
            return matching
        })
    )

    availableLayers.map((a) =>
        console.log(
            "Availabe layers at current location:",
            a.map((al) => al.properties.id)
        )
    )

    new BackgroundLayerResetter(bg, availableLayers)
    new SvelteUIElement(RasterLayerPicker, { availableLayers, value: bg }).AttachTo("extradiv")
}

main().then((_) => {})
