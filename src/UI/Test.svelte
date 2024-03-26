<script lang="ts">
  import MaplibreMap from "./Map/MaplibreMap.svelte"
  import { UIEventSource } from "../Logic/UIEventSource"
  import { MapLibreAdaptor } from "./Map/MapLibreAdaptor"
  import { Map as MlMap } from "maplibre-gl"
  import { AvailableRasterLayers } from "../Models/RasterLayers"
  import { QueryParameters } from "../Logic/Web/QueryParameters"

  const map = new UIEventSource<MlMap>(undefined)
  const mla = new MapLibreAdaptor(map, {
    location: new UIEventSource<{ lon: number; lat: number }>({
     lat: 51.0323, lon: 3.7416
    }),
    zoom: UIEventSource.asFloat(QueryParameters.GetQueryParameter("z", 13+"")),
    rasterLayer: new UIEventSource(AvailableRasterLayers.globalLayers.at(5))
  })
</script>

<div class="w-full h-screen">
  <MaplibreMap {map} />
</div>

