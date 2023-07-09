<script lang="ts">
  /**
   * The 'MaplibreMap' maps various event sources onto MapLibre.
   *
   * As it replaces the old 'MinimapObj' onto MapLibre and the existing codebase, this is sometimes a bit awkward
   */
  import { onMount } from "svelte"
  import { Map } from "@onsvisual/svelte-maps"
  import type { Map as MaplibreMap } from "maplibre-gl"
  import type {Readable, Writable} from "svelte/store"
  import { AvailableRasterLayers } from "../../Models/RasterLayers"
  import {writable} from "svelte/store";

  /**
   * Beware: this map will _only_ be set by this component
   * It should thus be treated as a 'store' by external parties
   */
  export let map: Writable<MaplibreMap>

  export let attribution = false
  export let center: Readable<{ lng: number ,lat : number }> = writable({lng: 0, lat: 0})

  onMount(() => {
    $map.on("load", function () {
      $map.resize()
    })
  })
  const styleUrl = AvailableRasterLayers.maplibre.properties.url
</script>

<main>
  <Map
    bind:center
    bind:map={$map}
    {attribution}
    css="./maplibre-gl.css"
    id="map"
    location={{ lng: 0, lat: 0, zoom: 0 }}
    maxzoom="24"
    style={styleUrl}
  />
</main>

<style>
  main {
    width: 100%;
    height: 100%;
    position: relative;
  }
</style>
