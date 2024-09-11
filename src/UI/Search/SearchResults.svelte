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

  export let state: ThemeViewState
  let activeFilters: Store<ActiveFilter[]> = state.layerState.activeFilters.map(fs => fs.filter(f => Constants.priviliged_layers.indexOf(<any>f.layer.id) < 0))
  let allowOtherThemes = state.featureSwitches.featureSwitchBackToThemeOverview
  let searchTerm = state.searchState.searchTerm
</script>
<div class="p-4 low-interaction flex gap-y-2 flex-col">

  <ActiveFilters {state} activeFilters={$activeFilters} />

  {#if $searchTerm.length === 0 && $activeFilters.length === 0 }
    <div class="p-8 items-center text-center">
      <b><Tr t={Translations.t.general.search.instructions}/></b>
    </div>
  {/if}

  <FilterResults {state}/>

  <GeocodeResults {state}/>

  {#if $allowOtherThemes}
    <ThemeResults {state} />
  {/if}
</div>
