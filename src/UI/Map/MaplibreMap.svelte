<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import type { Map } from "maplibre-gl"
  import * as maplibre from "maplibre-gl"
  import type { Readable, Writable } from "svelte/store"
  import { get, writable } from "svelte/store"
  import { AvailableRasterLayers } from "../../Models/RasterLayers"
  import { Utils } from "../../Utils"
  import { ariaLabel } from "../../Utils/ariaLabel"
  import Translations from "../i18n/Translations"

  /**
   * The 'MaplibreMap' maps various event sources onto MapLibre.
   */

  /**
   * Beware: this map will _only_ be set by this component
   * It should thus be treated as a 'store' by external parties
   */
  export let map: Writable<Map>

  let container: HTMLElement

  export let center: { lng: number; lat: number } | Readable<{ lng: number; lat: number }> =
    writable({ lng: 0, lat: 0 })
  export let zoom: Readable<number> = writable(1)

  const styleUrl = AvailableRasterLayers.maptilerDefaultLayer.properties.url

  let _map: Map
  onMount(() => {
    let _center: { lng: number; lat: number }
    if (typeof center["lng"] === "number" && typeof center["lat"] === "number") {
      _center = <any>center
    } else {
      _center = get(<any>center)
    }

    _map = new maplibre.Map({
      container,
      style: styleUrl,
      zoom: get(zoom),
      center: _center,
      maxZoom: 24,
      interactive: true,
      attributionControl: false,
    })
    window.requestAnimationFrame(() => {
      _map.resize()
    })
    _map.on("load", function() {
      _map.resize()
      const canvas = _map.getCanvas()
      ariaLabel(canvas, Translations.t.general.visualFeedback.navigation)
      canvas.role="application"
    })
    map.set(_map)
  })
  onDestroy(async () => {
    await Utils.waitFor(250)
    if (_map) _map.remove()
    map = null
  })

  
</script>

<svelte:head>
  <link href="./maplibre-gl.css" rel="stylesheet" />
</svelte:head>

<div
  bind:this={container}
  class="map relative top-0 left-0 w-full h-full"
  id="map"
/>
