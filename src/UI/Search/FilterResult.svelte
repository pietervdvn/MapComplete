<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import Tr from "../Base/Tr.svelte"
  import type { FilterPayload, FilterResult, LayerResult } from "../../Logic/Search/GeocodingProvider"
  import { createEventDispatcher } from "svelte"
  import Icon from "../Map/Icon.svelte"
  import Marker from "../Map/Marker.svelte"
  import ToSvelte from "../Base/ToSvelte.svelte"

  export let entry: FilterResult | LayerResult
  export let state: SpecialVisualizationState
  let dispatch = createEventDispatcher<{ select }>()


  function apply() {
      state.searchState.apply(entry)
      dispatch("select")
  }
</script>
<button on:click={() => apply()}>
  <div class="flex flex-col items-start">
    <div class="flex items-center gap-x-1">
      {#if entry.category === "layer"}
        <div class="w-8 h-8 p-1">
          <ToSvelte construct={entry.payload.defaultIcon()} />
        </div>
        <b>
          <Tr t={entry.payload.name} />
        </b>
      {:else}
        <Icon icon={entry.payload.option.icon ?? entry.payload. option.emoji} clss="w-4 h-4" emojiHeight="14px" />
        <Tr cls="whitespace-nowrap" t={entry.payload.option.question} />
      {/if}
    </div>
  </div>
</button>
