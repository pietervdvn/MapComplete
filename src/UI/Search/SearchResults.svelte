<script lang="ts">
  import { Store } from "../../Logic/UIEventSource"
  import ActiveFilters from "./ActiveFilters.svelte"
  import Constants from "../../Models/Constants"
  import type { ActiveFilter } from "../../Logic/State/LayerState"
  import ThemeResults from "./ThemeResults.svelte"
  import GeocodeResults from "./GeocodeResults.svelte"
  import FilterResults from "./FilterResults.svelte"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import type { FilterSearchResult } from "../../Logic/Search/FilterSearch"
  import { WithSearchState } from "../../Models/ThemeViewState/WithSearchState"

  export let state: WithSearchState
  let activeFilters: Store<(ActiveFilter & FilterSearchResult)[]> =
    state.layerState.activeFilters.map((fs) =>
      fs
        .filter((f) => f.filter.options[0].fields.length === 0 && !Constants.isPriviliged(f.layer))
        .map((af) => {
          const index = <number>af.control.data
          const r: FilterSearchResult & ActiveFilter = {
            ...af,
            index,
            option: af.filter.options[index],
          }
          return r
        })
    )
  let searchTerm = state.searchState.searchTerm

  let allowOtherThemes = state.featureSwitches.featureSwitchBackToThemeOverview
  let allowFilters = state.featureSwitches.featureSwitchFilter
</script>

<div class="low-interaction flex flex-col gap-y-2 p-4">
  {#if $allowFilters}
    <ActiveFilters {state} activeFilters={$activeFilters} />
  {/if}
  {#if $searchTerm.length === 0 && $activeFilters.length === 0}
    <div class="items-center p-8 text-center">
      <b>
        <Tr t={Translations.t.general.search.instructions} />
      </b>
    </div>
  {/if}

  {#if $allowFilters}
    <FilterResults {state} />
  {/if}
  <GeocodeResults {state} />

  {#if $allowOtherThemes}
    <ThemeResults {state} />
  {/if}
</div>
