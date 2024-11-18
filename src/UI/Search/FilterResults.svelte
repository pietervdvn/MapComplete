<script lang="ts">
  import { default as FilterResultSvelte } from "./FilterResult.svelte"
  import SidebarUnit from "../Base/SidebarUnit.svelte"

  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import FilterSearch from "../../Logic/Search/FilterSearch"
  import type { FilterSearchResult } from "../../Logic/Search/FilterSearch"

  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import Locale from "../i18n/Locale"
  import { Store } from "../../Logic/UIEventSource"
  import AccordionSingle from "../Flowbite/AccordionSingle.svelte"

  export let state: SpecialVisualizationState
  let searchTerm = state.searchState.searchTerm
  let activeLayers = state.layerState.activeLayers
  let filterResults = state.searchState.filterSuggestions

  let filtersMerged = filterResults.map(
    (filters) => FilterSearch.mergeSemiIdenticalLayers(filters, Locale.language.data),
    [Locale.language]
  )

  let layerResults = state.searchState.layerSuggestions.map(
    (layers) => {
      const nowActive = activeLayers.data.filter((al) => al.layerDef.isNormal())
      if (nowActive.length === 1) {
        const shownInActiveFiltersView = nowActive[0]
        layers = layers.filter((l) => l.id !== shownInActiveFiltersView.layerDef.id)
      }
      return layers
    },
    [activeLayers]
  )
  let filterResultsClipped: Store<{
    clipped: (FilterSearchResult[] | LayerConfig)[]
    rest?: (FilterSearchResult[] | LayerConfig)[]
  }> = filtersMerged.mapD(
    (filters) => {
      let layers = layerResults.data
      const ls: (FilterSearchResult[] | LayerConfig)[] = [].concat(layers, filters)
      if (ls.length <= 6) {
        return { clipped: ls }
      }
      return { clipped: ls.slice(0, 4), rest: ls.slice(4) }
    },
    [layerResults, activeLayers, Locale.language]
  )
</script>

{#if $searchTerm.length > 0 && ($filterResults.length > 0 || $layerResults.length > 0)}
  <SidebarUnit>
    <h3>
      <Tr t={Translations.t.general.search.pickFilter} />
    </h3>

    <div class="flex flex-wrap">
      {#each $filterResultsClipped.clipped as filterResult (filterResult)}
        <FilterResultSvelte {state} entry={filterResult} />
      {/each}
    </div>
    {#if $filtersMerged.length + $layerResults.length > $filterResultsClipped.clipped.length}
      <AccordionSingle noBorder>
        <div class="subtle flex justify-end text-sm" slot="header">
          <Tr
            t={Translations.t.general.search.nMoreFilters.Subs({
              n:
                $filtersMerged.length + $layerResults.length - $filterResultsClipped.clipped.length,
            })}
          />
        </div>
        <div class="flex flex-wrap overflow-y-auto">
          {#each $filterResultsClipped.rest as filterResult (filterResult)}
            <FilterResultSvelte {state} entry={filterResult} />
          {/each}
        </div>
      </AccordionSingle>
    {/if}
  </SidebarUnit>
{/if}
