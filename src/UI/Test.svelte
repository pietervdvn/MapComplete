<script lang="ts">
    // Testing grounds
    import { UIEventSource } from "../Logic/UIEventSource"
    import MaplibreMap from "./Map/MaplibreMap.svelte"
    import { Map as MlMap } from "maplibre-gl"
    import { MapLibreAdaptor } from "./Map/MapLibreAdaptor"
    import shops from "../assets/generated/layers/shops.json"
    import LayerConfig from "../Models/ThemeConfig/LayerConfig"
    import DynamicMvtileSource from "../Logic/FeatureSource/TiledFeatureSource/DynamicMvtTileSource"
    import ShowDataLayer from "./Map/ShowDataLayer"

    const tl = new LayerConfig(<any>shops)


    let map: UIEventSource<MlMap> = new UIEventSource<MlMap>(undefined)
    let adaptor = new MapLibreAdaptor(map)

    const src = new DynamicMvtileSource(tl, adaptor)
    new ShowDataLayer(map, {
        layer: tl,
        features: src
    })

    adaptor.location.setData({
        lat: 51.2095, lon: 3.2260,
    })
    adaptor.zoom.setData(13)

</script>

<div class="h-screen w-screen">
  <MaplibreMap {map} />
</div>
