<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import Tr from "../Base/Tr.svelte"
  import type { FilterPayload } from "../../Logic/Geocoding/GeocodingProvider"
  import { createEventDispatcher } from "svelte"
  import Icon from "../Map/Icon.svelte"

  export let entry: FilterPayload
  let { option } = entry
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
      <Icon icon={option.icon ?? option.emoji} clss="w-4 h-4" emojiHeight="14px" />
      <Tr cls="whitespace-nowrap" t={option.question} />
    </div>
  </div>
</button>
