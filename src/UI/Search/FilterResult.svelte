<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import Tr from "../Base/Tr.svelte"
  import { createEventDispatcher } from "svelte"
  import Icon from "../Map/Icon.svelte"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import type { FilterSearchResult } from "../../Logic/Search/FilterSearch"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"

  export let entry: FilterSearchResult | LayerConfig
  let isLayer = entry instanceof LayerConfig
  let asLayer = <LayerConfig> entry
  let asFilter = <FilterSearchResult> entry
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
      {#if isLayer}
        <div class="w-8 h-8 p-1">
          <ToSvelte construct={asLayer.defaultIcon()} />
        </div>
        <b>
          <Tr t={asLayer.name} />
        </b>
      {:else}
        <Icon icon={asFilter.option.icon ?? asFilter.option.emoji} clss="w-4 h-4" emojiHeight="14px" />
        <Tr cls="whitespace-nowrap" t={asFilter.option.question} />
      {/if}
    </div>
  </div>
</button>
