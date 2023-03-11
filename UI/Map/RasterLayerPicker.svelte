<script lang="ts">
  import type { Readable, Writable } from "svelte/store";
  import type { RasterLayerPolygon } from "../../Models/RasterLayers";

  /***
   * Chooses a background-layer out of available options
   */
  export let availableLayers: Readable<RasterLayerPolygon[]>
  export let value: Writable<RasterLayerPolygon>
</script>

<select bind:value={$value}>
  {#each $availableLayers as availableLayer }
    <option value={availableLayer}>
      {availableLayer.properties.name}
    </option>
  {/each}
</select>
