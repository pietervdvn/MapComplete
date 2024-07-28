<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import type { Map, MapOptions } from "maplibre-gl"
  import * as maplibre from "maplibre-gl"
  import type { Writable } from "svelte/store"
  import { AvailableRasterLayers } from "../../Models/RasterLayers"
  import { Utils } from "../../Utils"
  import { ariaLabel } from "../../Utils/ariaLabel"
  import Translations from "../i18n/Translations"
  import type { MapProperties } from "../../Models/MapProperties"
  import type { RasterLayerProperties } from "../../Models/RasterLayerProperties"

  /**
   * The 'MaplibreMap' maps various event sources onto MapLibre.
   */

  /**
   * Beware: this map will _only_ be set by this component
   * It should thus be treated as a 'store' by external parties
   */
  export let map: Writable<Map> = undefined
  export let mapProperties: MapProperties = undefined

  export let interactive: boolean = true
  /**
   * If many maps are shown (> ~15), Chromium will drop some because of "too Much WEBGL-contexts" (see issue #2024 or https://webglfundamentals.org/webgl/lessons/webgl-multiple-views.html)
   * For important maps (e.g. the main map), we want to recover from this
   */
  export let autorecovery: boolean = false

  let container: HTMLElement

  let _map: Map
  function initMap() {
    const { lon, lat } = mapProperties?.location?.data ?? { lon: 0, lat: 0 }

    const rasterLayer: RasterLayerProperties = mapProperties?.rasterLayer?.data?.properties
    let styleUrl: string
    if (rasterLayer?.type === "vector") {
      styleUrl =
        rasterLayer?.style ??
        rasterLayer?.url ??
        AvailableRasterLayers.defaultBackgroundLayer.properties.url
    } else {
      const defaultLayer = AvailableRasterLayers.defaultBackgroundLayer.properties
      styleUrl = defaultLayer.style ?? defaultLayer.url
    }

    console.log("Initiating mapLIbremap with style", styleUrl)

    const options: MapOptions = {
      container,
      style: styleUrl,
      zoom: mapProperties?.zoom?.data ?? 1,
      center: { lng: lon, lat },
      maxZoom: 24,
      interactive: true,
      attributionControl: false,
    }
    _map = new maplibre.Map(options)
    window.requestAnimationFrame(() => {
      _map.resize()
    })

    _map.on("load", function () {
      _map.resize()
      const canvas = _map.getCanvas()
      canvas.addEventListener("webglcontextlost", (e) => {
        console.warn("A MapLibreMap lost their context. Recovery is", autorecovery, e)
        try {
          _map?.remove()
        } catch (e) {
          console.debug("Could not remove map due to", e)
        }
        if (autorecovery) {
          requestAnimationFrame(() => {
            console.warn("Attempting map recovery")
            _map = new maplibre.Map(options)
            initMap()
          })
        }
      })
      if (interactive) {
        ariaLabel(canvas, Translations.t.general.visualFeedback.navigation)
        canvas.role = "application"
        canvas.tabIndex = 0
      } else {
        canvas.tabIndex = -1
        _map.getContainer().tabIndex = -1
      }
    })
    map.set(_map)
  }

  onMount(() => initMap())

  onDestroy(async () => {
    await Utils.waitFor(100)
    requestAnimationFrame(() => {
      try {
        _map?.remove()
        console.log("Removed map")
        map = null
      } catch (e) {
        console.error("Could not destroy map")
      }
    })
  })
</script>

<svelte:head>
  <link href="./maplibre-gl.css" rel="stylesheet" />
</svelte:head>

<div bind:this={container} class="map relative top-0 left-0 h-full w-full" id="map" />
