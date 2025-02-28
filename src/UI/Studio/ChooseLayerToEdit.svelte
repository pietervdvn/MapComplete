<script lang="ts">
  import { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import EditItemButton from "./EditItemButton.svelte"
  import { Store } from "../../Logic/UIEventSource"

  export let layerIds: Store<{ id: string; owner: number }[]>
  export let category: "layers" | "themes" = "layers"
  export let osmConnection: OsmConnection
</script>

{#if $layerIds.length > 0}
  <slot name="title" />
  <div class="flex flex-wrap">
    {#each Array.from($layerIds) as layer (layer)}
      <EditItemButton info={layer} {category} {osmConnection} on:layerSelected />
    {/each}
  </div>
{/if}
