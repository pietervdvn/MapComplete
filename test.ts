import SvelteUIElement from "./UI/Base/SvelteUIElement"
import MaplibreMap from "./UI/Map/MaplibreMap.svelte"
import { UIEventSource } from "./Logic/UIEventSource"
import { MapLibreAdaptor } from "./UI/Map/MapLibreAdaptor"
import { AvailableRasterLayers, RasterLayerPolygon } from "./Models/RasterLayers"
import type { Map as MlMap } from "maplibre-gl"
import { ShowDataLayer } from "./UI/Map/ShowDataLayer"
import LayerConfig from "./Models/ThemeConfig/LayerConfig"
import * as bench from "./assets/generated/layers/bench.json"
import { Utils } from "./Utils"
import SimpleFeatureSource from "./Logic/FeatureSource/Sources/SimpleFeatureSource"
import { FilterState } from "./Models/FilteredLayer"
import { FixedUiElement } from "./UI/Base/FixedUiElement"

async function main() {
    const mlmap = new UIEventSource<MlMap>(undefined)
    const location = new UIEventSource<{ lon: number; lat: number }>({
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
    const mla = new MapLibreAdaptor(mlmap, {
        rasterLayer: bg,
        location,
    })

    const features = new UIEventSource([
        {
            feature: {
                type: "Feature",
                properties: {
                    hello: "world",
                    id: "" + 1,
                },
                geometry: {
                    type: "Point",
                    coordinates: [3.1, 51.2],
                },
            },
            freshness: new Date(),
        },
    ])
    const layer = new LayerConfig(bench)
    const options = {
        zoomToFeatures: false,
        features: new SimpleFeatureSource(
            {
                layerDef: layer,
                isDisplayed: new UIEventSource<boolean>(true),
                appliedFilters: new UIEventSource<Map<string, FilterState>>(undefined),
            },
            0,
            features
        ),
        layer,
    }
    new ShowDataLayer(mlmap, options)
    mla.zoom.set(9)
    mla.location.set({ lon: 3.1, lat: 51.1 })
    const availableLayers = AvailableRasterLayers.layersAvailableAt(location)
    // new BackgroundLayerResetter(bg, availableLayers)
    // new SvelteUIElement(RasterLayerPicker, { availableLayers, value: bg }).AttachTo("extradiv")
    for (let i = 0; i <= 10; i++) {
        await Utils.waitFor(1000)
        features.ping()
        new FixedUiElement("> " + (5 - i)).AttachTo("extradiv")
    }
    options.zoomToFeatures = false
    features.setData([
        {
            feature: {
                type: "Feature",
                properties: {
                    hello: "world",
                    id: "" + 1,
                },
                geometry: {
                    type: "Point",
                    coordinates: [3.103, 51.10003],
                },
            },
            freshness: new Date(),
        },
    ])
    new FixedUiElement("> OK").AttachTo("extradiv")
}

main().then((_) => {})
