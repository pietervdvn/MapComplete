<script lang="ts">
  import type { GeoCodeResult } from "../../Logic/Geocoding/GeocodingProvider"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import { GeoOperations } from "../../Logic/GeoOperations"
  import { createEventDispatcher } from "svelte"

  export let entry: GeoCodeResult
  export let state: SpecialVisualizationState
  let layer: LayerConfig
  if (entry.feature) {
    layer = state.layout.getMatchingLayer(entry.feature.properties)
  }

  let dispatch = createEventDispatcher<{select}>()
  let distance = state.mapProperties.location.mapD(l => GeoOperations.distanceBetween([l.lon, l.lat], [entry.lon, entry.lat]))

  function select() {
    state.mapProperties.flyTo(entry.lon, entry.lat, 17)
    if (entry.feature) {
      state.selectedElement.set(entry.feature)
    }
    dispatch("select")
  }
</script>
<button class="unstyled w-full link-no-underline"
        on:click={() => select()}>
  <div class="p-2 flex items-center w-full gap-y-2 ">

    {#if layer}
      <ToSvelte construct={() => layer.defaultIcon(entry.feature.properties).SetClass("w-6 h-6")} />
    {/if}
    <div class="flex flex-col items-start pl-2">
  <div class="flex">

      {entry.display_name ?? entry.osm_id}
  </div>
      <div class="subtle">
        {#if $distance}
          {GeoOperations.distanceToHuman($distance)}
        {/if}
      </div>
    </div>
  </div>
</button>
