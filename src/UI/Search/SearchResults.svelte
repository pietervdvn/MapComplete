<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import Loading from "../Base/Loading.svelte"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import { default as SearchResultSvelte } from "./SearchResult.svelte"
  import MoreScreen from "../BigComponents/MoreScreen"
  import type { GeocodeResult, SearchResult } from "../../Logic/Geocoding/GeocodingProvider"
  import ActiveFilters from "./ActiveFilters.svelte"
  import Constants from "../../Models/Constants"
  import type { ActiveFilter } from "../../Logic/State/LayerState"

  export let state: SpecialVisualizationState
  export let results: SearchResult[]
  export let searchTerm: Store<string>
  export let isFocused: UIEventSource<boolean>
  let activeFilters: Store<ActiveFilter[]> = state.layerState.activeFilters.map(fs => fs.filter(f => Constants.priviliged_layers.indexOf(<any>f.layer.id) < 0))

  let hasActiveFilters = activeFilters.map(afs => afs.length > 0)

  let recentlySeen: Store<GeocodeResult[]> = state.recentlySearched.seenThisSession
  let recentThemes = state.userRelatedState.recentlyVisitedThemes.mapD(thms => thms.filter(th => th !== state.layout.id).slice(0, 3))
  let allowOtherThemes = state.featureSwitches.featureSwitchBackToThemeOverview
</script>

<div class="relative w-full h-full collapsable " class:collapsed={!$isFocused && !$hasActiveFilters}>
  <div class="searchbox normal-background">
    <ActiveFilters activeFilters={$activeFilters} />
    {#if $isFocused}
      {#if $searchTerm.length > 0 && results === undefined}
        <div class="flex justify-center m-4 my-8">
          <Loading />
        </div>
      {:else if results?.length > 0}
        <div style="max-height: calc(50vh - 1rem - 2px);" class="overflow-y-auto p-2" tabindex="-1">

          {#each results as entry (entry)}
            <SearchResultSvelte on:select {entry} {state} />
          {/each}
        </div>
      {:else if $searchTerm.length > 0 || $recentlySeen?.length > 0 || $recentThemes?.length > 0}
        <div style="max-height: calc(50vh - 1rem - 2px);" class="overflow-y-auto p-2 flex flex-col gap-y-8"
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
    {/if}
  </div>
</div>

<style>
    .searchbox {
        display: flex;
        flex-direction: column;
        row-gap: 0.5rem;
        padding: 0.5rem;
        border: 1px solid black;
        border-radius: 0.5rem;
    }

    .collapsable {
        max-height: 50vh;
        transition: max-height 400ms linear;
        transition-delay: 100ms;
        overflow: hidden;
        padding: 0 !important;
    }

    .collapsed {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        max-height: 0 !important;
    }
</style>
