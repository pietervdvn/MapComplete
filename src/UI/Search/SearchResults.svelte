<script lang="ts">
  import { Store } from "../../Logic/UIEventSource"
  import Loading from "../Base/Loading.svelte"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import { default as SearchResultSvelte } from "./SearchResult.svelte"
  import MoreScreen from "../BigComponents/MoreScreen"
  import type { GeocodeResult } from "../../Logic/Geocoding/GeocodingProvider"

  import ActiveFilters from "./ActiveFilters.svelte"
  import Constants from "../../Models/Constants"
  import type { ActiveFilter } from "../../Logic/State/LayerState"
  import ThemeViewState from "../../Models/ThemeViewState"
  import FilterResult from "./FilterResult.svelte"
  import ThemeResult from "./ThemeResult.svelte"

  export let state: ThemeViewState
  let activeFilters: Store<ActiveFilter[]> = state.layerState.activeFilters.map(fs => fs.filter(f => Constants.priviliged_layers.indexOf(<any>f.layer.id) < 0))
  let recentlySeen: Store<GeocodeResult[]> = state.searchState.recentlySearched.seenThisSession
  let recentThemes = state.userRelatedState.recentlyVisitedThemes.mapD(thms => thms.filter(th => th !== state.layout.id).slice(0, 3))
  let allowOtherThemes = state.featureSwitches.featureSwitchBackToThemeOverview
  let searchTerm = state.searchState.searchTerm
  let results = state.searchState.suggestions
  let filterResults = state.searchState.filterSuggestions
  let themeResults = state.searchState.themeSuggestions

</script>
<div class="p-4">

  <ActiveFilters activeFilters={$activeFilters} />

  {#if $filterResults.length > 0}
    <h3>Pick a filter below</h3>

    <div class="flex flex-wrap">
      {#each $filterResults as filterResult (filterResult)}
        <FilterResult {state} entry={filterResult} />
      {/each}
    </div>
  {/if}

  {#if $searchTerm.length > 0}
    <h3>Locations</h3>
  {/if}
  {#if $searchTerm.length > 0 && $results === undefined}
    <div class="flex justify-center m-4 my-8">
      <Loading />
    </div>
  {:else if $results?.length > 0}
    {#each $results as entry (entry)}
      <SearchResultSvelte on:select {entry} {state} />
    {/each}
  {:else if $searchTerm.length > 0 || $recentlySeen?.length > 0 || $recentThemes?.length > 0}
    <div class="flex flex-col gap-y-8"
         tabindex="-1">
      {#if $searchTerm.length > 0}
        <b class="flex justify-center p-4">
          <Tr t={Translations.t.general.search.nothingFor.Subs({term: $searchTerm})} />
        </b>
      {/if}

      {#if $recentlySeen?.length > 0}
        <div>
          <h3 class="m-2">
            <Tr t={Translations.t.general.search.recents} />
          </h3>
          {#each $recentlySeen as entry}
            <SearchResultSvelte {entry} {state} on:select />
          {/each}
        </div>
      {/if}

      {#if $recentThemes?.length > 0 && $allowOtherThemes}
        <div>
          <h3 class="m-2">
            <Tr t={Translations.t.general.search.recentThemes} />
          </h3>
          {#each $recentThemes as themeId (themeId)}
            <SearchResultSvelte
              entry={{payload: MoreScreen.officialThemesById.get(themeId), osm_id: themeId, category: "theme"}}
              {state}
              on:select />
          {/each}
        </div>
      {/if}
    </div>
  {/if}


  {#if $themeResults.length > 0}
    <h3>
      Other maps
    </h3>
    {#each $themeResults as entry}
      <ThemeResult {state} {entry} />
    {/each}
  {/if}

</div>
