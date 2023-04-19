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


  /**
   * Beware: this map will _only_ be set by this component
   * It should thus be treated as a 'store' by external parties
   */
  export let map:  Writable<MaplibreMap>

  export let attribution = true
  let center = {};

  onMount(() => {
    $map.on("load", function() {
     $map.resize();
    });
  });
  const styleUrl = "https://api.maptiler.com/maps/15cc8f61-0353-4be6-b8da-13daea5f7432/style.json?key=GvoVAJgu46I5rZapJuAy";
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
