<script lang="ts">
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import type { RasterLayerPolygon } from "../../Models/RasterLayers"
  import { AvailableRasterLayers } from "../../Models/RasterLayers"
  import { createEventDispatcher, onDestroy } from "svelte"
  import Svg from "../../Svg"
  import { Map as MlMap } from "maplibre-gl"
  import type { MapProperties } from "../../Models/MapProperties"
  import OverlayMap from "../Map/OverlayMap.svelte"
  import RasterLayerPicker from "../Map/RasterLayerPicker.svelte"

  export let mapproperties: MapProperties
  export let normalMap: UIEventSource<MlMap>
  /**
   * The current background (raster) layer of the polygon.
   * This is undefined if a vector layer is used
   */
  let rasterLayer: UIEventSource<RasterLayerPolygon | undefined> = mapproperties.rasterLayer
  let name = rasterLayer.data?.properties?.name
  let icon = Svg.satellite_svg()
  onDestroy(
    rasterLayer.addCallback((polygon) => {
      name = polygon.properties?.name
    })
  )
  /**
   * The layers that this component can offer as a choice.
   */
  export let availableRasterLayers: Store<RasterLayerPolygon[]>

  let raster0 = new UIEventSource<RasterLayerPolygon>(undefined)

  let raster1 = new UIEventSource<RasterLayerPolygon>(undefined)

  let currentLayer: RasterLayerPolygon

  function updatedAltLayer() {
    const available = availableRasterLayers.data
    const current = rasterLayer.data
    const defaultLayer = AvailableRasterLayers.maptilerDefaultLayer
    const firstOther = available.find((l) => l !== defaultLayer)
    const secondOther = available.find((l) => l !== defaultLayer && l !== firstOther)
    raster0.setData(firstOther === current ? defaultLayer : firstOther)
    raster1.setData(secondOther === current ? defaultLayer : secondOther)
  }

  updatedAltLayer()
  onDestroy(mapproperties.rasterLayer.addCallbackAndRunD(updatedAltLayer))
  onDestroy(availableRasterLayers.addCallbackAndRunD(updatedAltLayer))

  function use(rasterLayer: UIEventSource<RasterLayerPolygon>): () => void {
    return () => {
      currentLayer = undefined
      mapproperties.rasterLayer.setData(rasterLayer.data)
    }
  }

  const dispatch = createEventDispatcher<{ copyright_clicked }>()
</script>

<div class="flex items-end opacity-50 hover:opacity-100">
  <div class="flex flex-col md:flex-row">
    <button class="m-0 h-12 w-16 overflow-hidden p-0 md:h-16 md:w-16" on:click={use(raster0)}>
      <OverlayMap
        placedOverMap={normalMap}
        placedOverMapProperties={mapproperties}
        rasterLayer={raster0}
      />
    </button>
    <button class="m-0 h-12 w-16 overflow-hidden p-0 md:h-16 md:w-16" on:click={use(raster1)}>
      <OverlayMap
        placedOverMap={normalMap}
        placedOverMapProperties={mapproperties}
        rasterLayer={raster1}
      />
    </button>
  </div>
  <div class="ml-1 flex h-fit flex-col gap-y-1 text-sm">
    <div class="low-interaction w-64 rounded p-1">
      <RasterLayerPicker
        availableLayers={availableRasterLayers}
        value={mapproperties.rasterLayer}
      />
    </div>

    <button class="small" on:click={() => dispatch("copyright_clicked")}>© OpenStreetMap</button>
  </div>
</div>
