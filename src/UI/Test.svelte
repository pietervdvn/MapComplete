<script lang="ts">
  // Testing grounds
  import { UIEventSource } from "../Logic/UIEventSource"
  import MaplibreMap from "./Map/MaplibreMap.svelte"
  import { Map as MlMap } from "maplibre-gl"
  import { MapLibreAdaptor } from "./Map/MapLibreAdaptor"

  let map: UIEventSource<MlMap> = new UIEventSource<MlMap>(undefined)
  let adaptor = new MapLibreAdaptor(map)
  adaptor.location.setData({
    lat: 42.5404,
    lon:1.4832
    
  })
  adaptor.zoom.setData(10)
  map.addCallbackAndRunD(map => {
    map.on("load", () => {

      map.addSource("drinking_water", {
        "type": "vector",
        "tiles": ["http://127.0.0.2:7800/public.drinking_water/{z}/{x}/{y}.pbf"] // http://127.0.0.2:7800/public.drinking_water.json",
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
      )

        map.addSource("toilet", {
            "type": "vector",
            "tiles": ["http://127.0.0.2:7800/public.toilet/{z}/{x}/{y}.pbf"] // http://127.0.0.2:7800/public.drinking_water.json",
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

      map.on('click', 'drinking_water_layer', (e) => {
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
