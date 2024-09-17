<script lang="ts">
  import { Store } from "../../Logic/UIEventSource"
  import ActiveFilters from "./ActiveFilters.svelte"
  import Constants from "../../Models/Constants"
  import type { ActiveFilter } from "../../Logic/State/LayerState"
  import ThemeViewState from "../../Models/ThemeViewState"
  import ThemeResults from "./ThemeResults.svelte"
  import GeocodeResults from "./GeocodeResults.svelte"
  import FilterResults from "./FilterResults.svelte"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import type { FilterSearchResult } from "../../Logic/Search/FilterSearch"

  export let state: ThemeViewState
  let activeFilters: Store<(ActiveFilter & FilterSearchResult)[]> = state.layerState.activeFilters.map(fs => fs.filter(f =>
    (f.filter.options[0].fields.length === 0) &&
    Constants.priviliged_layers.indexOf(<any>f.layer.id) < 0)
    .map(af => {
      const index = <number> af.control.data
      const r : FilterSearchResult & ActiveFilter = { ...af, index, option: af.filter.options[index] }
      return r
    }))
  let allowOtherThemes = state.featureSwitches.featureSwitchBackToThemeOverview
  let searchTerm = state.searchState.searchTerm
</script>
<div class="p-4 low-interaction flex gap-y-2 flex-col">

  <ActiveFilters {state} activeFilters={$activeFilters} />

  {#if $searchTerm.length === 0 && $activeFilters.length === 0 }
    <div class="p-8 items-center text-center">
      <b>
        <Tr t={Translations.t.general.search.instructions} />
      </b>
    </div>
  {/if}

  <FilterResults {state} />

  <GeocodeResults {state} />

  {#if $allowOtherThemes}
    <ThemeResults {state} />
  {/if}
</div>
