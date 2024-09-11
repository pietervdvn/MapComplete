<script lang="ts">
  import { default as FilterResultSvelte } from "./FilterResult.svelte"
  import SidebarUnit from "../Base/SidebarUnit.svelte"

  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import type { FilterSearchResult } from "../../Logic/Search/FilterSearch"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"

  export let state: SpecialVisualizationState
  let searchTerm = state.searchState.searchTerm
  let activeLayers = state.layerState.activeLayers
  let filterResults = state.searchState.filterSuggestions


  let layerResults = state.searchState.layerSuggestions.map(layers => {
    const nowActive = activeLayers.data.filter(al => al.layerDef.isNormal())
    if (nowActive.length === 1) {
      const shownInActiveFiltersView = nowActive[0]
      layers = layers.filter(l => l.id !== shownInActiveFiltersView.layerDef.id)
    }
    return layers
  }, [activeLayers])
  let filterResultsClipped = filterResults.mapD(filters => {
    let layers = layerResults.data
    const ls: (FilterSearchResult | LayerConfig)[] = [].concat(layers, filters)
    if (ls.length <= 6) {
      return ls
    }
    return ls.slice(0, 4)
  }, [layerResults, activeLayers])
</script>

{#if $searchTerm.length > 0 && ($filterResults.length > 0 || $layerResults.length > 0)}
  <SidebarUnit>

    <h3><Tr t={Translations.t.general.search.pickFilter} /></h3>

    <div class="flex flex-wrap">
      {#each $filterResultsClipped as filterResult (filterResult)}
        <FilterResultSvelte {state} entry={filterResult} />
      {/each}
    </div>
    {#if $filterResults.length + $layerResults.length > $filterResultsClipped.length}
      <div class="flex justify-center">
        ... and {$filterResults.length + $layerResults.length - $filterResultsClipped.length} more ...
      </div>
    {/if}
  </SidebarUnit>
{/if}
