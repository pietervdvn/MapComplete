<script lang="ts">
  /**
   * The overlay map is a bit a weird map:
   * it is a HTML-component which is intended to be placed _over_ another map.
   * It will align itself in order to seamlessly show the same location; but possibly in a different style
   */
  import MaplibreMap from "./MaplibreMap.svelte"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import { Map as MlMap } from "maplibre-gl"
  import { MapLibreAdaptor } from "./MapLibreAdaptor"
  import type { MapProperties } from "../../Models/MapProperties"
  import { onDestroy } from "svelte"
  import type { RasterLayerPolygon } from "../../Models/RasterLayers"
  import StyleLoadingIndicator from "./StyleLoadingIndicator.svelte"

  export let placedOverMapProperties: MapProperties
  export let placedOverMap: Store<MlMap>

  export let interactive: boolean = undefined

  export let rasterLayer: UIEventSource<RasterLayerPolygon>

  export let visible: Store<boolean> = undefined
  let altmap: UIEventSource<MlMap> = new UIEventSource(undefined)
  let altproperties = new MapLibreAdaptor(altmap, {
    rasterLayer,
    zoom: UIEventSource.feedFrom(placedOverMapProperties.zoom),
    rotation: UIEventSource.feedFrom(placedOverMapProperties.rotation),
    pitch: UIEventSource.feedFrom(placedOverMapProperties.pitch),
  })
  altproperties.allowMoving.setData(false)
  altproperties.allowZooming.setData(false)

  function pixelCenterOf(map: UIEventSource<MlMap>): [number, number] {
    const rect = map?.data?.getCanvas()?.getBoundingClientRect()
    if (!rect) {
      return undefined
    }
    const x = (rect.left + rect.right) / 2
    const y = (rect.top + rect.bottom) / 2
    return [x, y]
  }

  function updateLocation() {
    if (!placedOverMap.data || !altmap.data) {
      return
    }
    altmap.data.resize()
    const altMapCenter = pixelCenterOf(altmap)
    const c = placedOverMap.data.unproject(altMapCenter)
    altproperties.location.setData({ lon: c.lng, lat: c.lat })
  }

  onDestroy(placedOverMapProperties.location.addCallbackAndRunD(updateLocation))
  updateLocation()
  window.setTimeout(updateLocation, 150)
  window.setTimeout(updateLocation, 500)

  if (visible) {
    onDestroy(
      visible?.addCallbackAndRunD((v) => {
        if (!v) {
          return
        }
        updateLocation()
        window.setTimeout(updateLocation, 150)
        window.setTimeout(updateLocation, 500)
      })
    )
  }
</script>

<div class="absolute flex h-full w-full items-center justify-center" style="z-index: 100">
  <StyleLoadingIndicator map={altmap} />
</div>
<MaplibreMap {interactive} map={altmap} mapProperties={altproperties} />
