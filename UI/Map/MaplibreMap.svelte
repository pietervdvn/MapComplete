<script lang="ts">
  /**
   * The 'MaplibreMap' maps various event sources onto MapLibre.
   *
   * As it replaces the old 'MinimapObj' onto MapLibre and the existing codebase, this is sometimes a bit awkward
   */
  import { onMount } from "svelte";
  import { Map } from "@onsvisual/svelte-maps";
  import type { Map as MaplibreMap } from "maplibre-gl";
  import type { Writable } from "svelte/store";
  import {AvailableRasterLayers} from "../../Models/RasterLayers";


  /**
   * Beware: this map will _only_ be set by this component
   * It should thus be treated as a 'store' by external parties
   */
  export let map:  Writable<MaplibreMap>

  export let attribution = false
  let center = {};

  onMount(() => {
    $map.on("load", function() {
     $map.resize();
    });
  });
  const styleUrl = AvailableRasterLayers.maplibre.properties.url;
</script>
<main>
  <Map bind:center={center}
       bind:map={$map}
       {attribution}
       css="./maplibre-gl.css"
       
       id="map" location={{lng: 0, lat: 0, zoom: 0}} maxzoom=24 style={styleUrl} />
</main>

<style>
    main {
        width: 100%;
        height: 100%;
        position: relative;
    }
</style>
