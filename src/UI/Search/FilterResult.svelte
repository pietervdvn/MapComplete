<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import Tr from "../Base/Tr.svelte"
  import Icon from "../Map/Icon.svelte"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import type { FilterSearchResult } from "../../Logic/Search/FilterSearch"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import Loading from "../Base/Loading.svelte"

  export let entry: FilterSearchResult[] | LayerConfig
  let asFilter: FilterSearchResult[]
  let asLayer: LayerConfig
  if(Array.isArray(entry)){
      asFilter = entry
  }else{
    asLayer = <LayerConfig>entry

  }
  export let state: SpecialVisualizationState

  let loading = false
  let debug = state.featureSwitches.featureSwitchIsDebugging

  function apply() {
    loading = true
    console.log("Loading is now ", loading)
    setTimeout(() => {
      window.requestAnimationFrame(() => {
        state.searchState.apply(entry)
        loading = false
        state.searchState.closeIfFullscreen()
      })
    }, 25)
  }
</script>
<button on:click={() => apply()} class:disabled={loading}>
  {#if loading}
    <Loading />
  {/if}
  <div class="flex flex-col items-start">
    <div class="flex items-center gap-x-1">
      {#if asLayer}
        <div class="w-8 h-8 p-1">
          <ToSvelte construct={asLayer.defaultIcon()} />
        </div>
        <b>
          <Tr t={asLayer.name} />
        </b>
      {:else}
        <Icon icon={asFilter[0].option.icon ?? asFilter[0].option.emoji} clss="w-4 h-4" emojiHeight="14px" />
        <Tr cls="whitespace-nowrap" t={asFilter[0].option.question} />
        {#if $debug}
        <span class="subtle">({asFilter.map(f => f.layer.id).join(", ")})</span>
          {/if}
      {/if}
    </div>
  </div>
</button>
