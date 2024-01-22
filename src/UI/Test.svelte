<script lang="ts">
    // Testing grounds
    import { UIEventSource } from "../Logic/UIEventSource"
    import MaplibreMap from "./Map/MaplibreMap.svelte"
    import { Map as MlMap } from "maplibre-gl"
    import { MapLibreAdaptor } from "./Map/MapLibreAdaptor"
    import Constants from "../Models/Constants"
    import toilet from "../assets/generated/layers/toilet.json"
    import LayerConfig from "../Models/ThemeConfig/LayerConfig"
    import DynamicMvtileSource from "../Logic/FeatureSource/TiledFeatureSource/DynamicMvtTileSource"
    import ShowDataLayer from "./Map/ShowDataLayer"

    const tl = new LayerConfig(<any>toilet)


    let map: UIEventSource<MlMap> = new UIEventSource<MlMap>(undefined)
    let adaptor = new MapLibreAdaptor(map)

    const src = new DynamicMvtileSource(tl, adaptor)
    src.features.addCallbackAndRun(f => console.log(">>> Features are", f))
    new ShowDataLayer(map, {
        layer: tl,
        features: src
    })

    adaptor.location.setData({
        lat: 51.2095, lon: 3.2260,
    })
    adaptor.zoom.setData(13)
    const loadedIcons = new Set<string>()

    async function loadImage(map: MlMap, url: string, name: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (loadedIcons.has(name)) {
                return new Promise<void>((resolve, reject) => resolve())
            }
            loadedIcons.add(name)
            if (Constants.defaultPinIcons.indexOf(url) >= 0) {
                url = "./assets/svg/" + url + ".svg"
            }
            map.loadImage(
                url,
                (error, image) => {
                    if (error) {
                        reject(error)
                    }
                    map.addImage(name, image)
                    resolve()
                })
        })
    }

    map.addCallbackAndRunD(map => {
        map.on("load", async () => {
            console.log("Onload")
            await loadImage(map, "https://upload.wikimedia.org/wikipedia/commons/7/7c/201408_cat.png", "cat")

            /*
            map.addSource("drinking_water", {
                "type": "vector",
                "tiles": ["http://127.0.0.2:7800/public.drinking_water/{z}/{x}/{y}.pbf"], // http://127.0.0.2:7800/public.drinking_water.json",
            })

            map.addLayer(
                {
                    "id": "drinking_water_layer",
                    "type": "circle",
                    "source": "drinking_water",
                    "source-layer": "public.drinking_water",
                    "paint": {
                        "circle-radius": 5,
                        "circle-color": "#ff00ff",
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#000000",
                    },
                },
            )*/
            /*
                        map.addSource("toilet", {
                            "type": "vector",
                            "tiles": ["http://127.0.0.2:7800/public.toilet/{z}/{x}/{y}.pbf"], // http://127.0.0.2:7800/public.drinking_water.json",
                        })
            
                        map.addLayer(
                            {
                                "id": "toilet_layer",
                                "type": "circle",
                                "source": "toilet",
                                "source-layer": "public.toilet",
                                "paint": {
                                    "circle-radius": 5,
                                    "circle-color": "#0000ff",
                                    "circle-stroke-width": 2,
                                    "circle-stroke-color": "#000000",
                                },
                            },
                        )
                        map.addLayer({
                            "id": "points",
                            "type": "symbol",
                            "source": "toilet",
                            "source-layer": "public.toilet",
                            "layout": {
                                "icon-overlap": "always",
                                "icon-image": "cat",
                                "icon-size": 0.05,
                            },
                        })*/


            map.on("click", "drinking_water_layer", (e) => {
// Copy coordinates array.
                console.log(e)
                console.warn(">>>", e.features[0])
            })
        })
    })
</script>

<div class="h-screen w-screen">
  <MaplibreMap {map} />
</div>
