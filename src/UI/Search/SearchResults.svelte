<script lang="ts">
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
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
  import SidebarUnit from "../Base/SidebarUnit.svelte"
  import { TrashIcon } from "@babeard/svelte-heroicons/mini"
  import { Dropdown, DropdownItem } from "flowbite-svelte"
  import DotsCircleHorizontal from "@rgossiaux/svelte-heroicons/solid/DotsCircleHorizontal"
  import DotMenu from "../Base/DotMenu.svelte"
  import { CogIcon } from "@rgossiaux/svelte-heroicons/solid"

  export let state: ThemeViewState
  let activeFilters: Store<ActiveFilter[]> = state.layerState.activeFilters.map(fs => fs.filter(f => Constants.priviliged_layers.indexOf(<any>f.layer.id) < 0))
  let recentlySeen: Store<GeocodeResult[]> = state.userRelatedState.recentlyVisitedSearch.value
  let recentThemes = state.userRelatedState.recentlyVisitedThemes.value.map(themes => themes.filter(th => th.id !== state.layout.id).slice(0, 6))
  let allowOtherThemes = state.featureSwitches.featureSwitchBackToThemeOverview
  let searchTerm = state.searchState.searchTerm
  let results = state.searchState.suggestions
  let isSearching = state.searchState.suggestionsSearchRunning
  let filterResults = state.searchState.filterSuggestions
  let themeResults = state.searchState.themeSuggestions

</script>
<div class="p-4 low-interaction flex gap-y-2 flex-col">

  <ActiveFilters activeFilters={$activeFilters} />

  {#if $searchTerm.length > 0 && $filterResults.length > 0}
    <SidebarUnit>

      <h3>Pick a filter below</h3>

      <div class="flex flex-wrap">
        {#each $filterResults as filterResult (filterResult)}
          <FilterResult {state} entry={filterResult} />
        {/each}
      </div>
    </SidebarUnit>
  {/if}

  <!-- Actual search results (or ""loading"", or ""no results"")-->
  {#if $searchTerm.length > 0}
    <SidebarUnit>

      <h3>Locations</h3>

      {#if $isSearching}
        <div class="flex justify-center m-4 my-8">
          <Loading />
        </div>
      {/if}

      {#if $results?.length > 0}
        {#each $results as entry (entry)}
          <SearchResultSvelte on:select {entry} {state} />
        {/each}

      {:else if !$isSearching}
        <b class="flex justify-center p-4">
          <Tr t={Translations.t.general.search.nothingFor.Subs({term: $searchTerm})} />
        </b>
      {/if}
    </SidebarUnit>

  {/if}


  <!-- Other maps which match the search term-->
  {#if $themeResults.length > 0}
    <SidebarUnit>
      <h3>
        Other maps
      </h3>
      {#each $themeResults as entry (entry.id)}
        <ThemeResult {entry} />
      {/each}
    </SidebarUnit>
  {/if}


  {#if $searchTerm.length == 0 && $recentlySeen?.length > 0}
    <SidebarUnit>
      <div class="flex justify-between">

        <h3 class="m-2">
          <Tr t={Translations.t.general.search.recents} />
        </h3>
        <DotMenu>
          <button on:click={() => {state.userRelatedState.recentlyVisitedSearch.clear()}}>
            <TrashIcon />
            Delete search history
          </button>
          <button on:click={() => state.guistate.openUsersettings("sync-visited-locations")}>
            <CogIcon />
            Edit sync settings
          </button>
        </DotMenu>
      </div>
      {#each $recentlySeen as entry (entry)}
        <SearchResultSvelte {entry} {state} on:select />
      {/each}
    </SidebarUnit>
  {/if}

  {#if $searchTerm.length === 0 && $recentThemes?.length > 0 && $allowOtherThemes}
    <SidebarUnit>
      <div class="flex w-full justify-between">

        <h3 class="m-2">
          <Tr t={Translations.t.general.search.recentThemes} />
        </h3>
        <DotMenu>
          <button on:click={() => {state.userRelatedState.recentlyVisitedThemes.clear()}}>
            <TrashIcon />
            Delete earlier visited themes
          </button>
          <button on:click={() => state.guistate.openUsersettings("sync-visited-themes")}>
            <CogIcon />
            Edit sync settings
          </button>
        </DotMenu>
      </div>
      {#each $recentThemes as themeId (themeId)}
        <SearchResultSvelte
          entry={{payload: MoreScreen.officialThemesById.get(themeId), osm_id: themeId, category: "theme"}}
          {state}
          on:select />
      {/each}

    </SidebarUnit>
  {/if}


</div>
