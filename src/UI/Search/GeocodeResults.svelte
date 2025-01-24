<script lang="ts">
  /**
   * Shows all the location-results
   */
  import Translations from "../i18n/Translations"
  import { Store } from "../../Logic/UIEventSource"
  import SidebarUnit from "../Base/SidebarUnit.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import Loading from "../Base/Loading.svelte"
  import { default as GeocodeResultSvelte } from "./GeocodeResult.svelte"
  import Tr from "../Base/Tr.svelte"
  import DotMenu from "../Base/DotMenu.svelte"
  import { CogIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { TrashIcon } from "@babeard/svelte-heroicons/mini"
  import type { GeocodeResult } from "../../Logic/Search/GeocodingProvider"
  import { WithSearchState } from "../../Models/ThemeViewState/WithSearchState"

  export let state: WithSearchState

  let searchTerm = state.searchState.searchTerm
  let results = state.searchState.suggestions
  let isSearching = state.searchState.suggestionsSearchRunning
  let recentlySeen: Store<GeocodeResult[]> = state.userRelatedState.recentlyVisitedSearch.value
  const t = Translations.t.general.search
</script>

{#if $searchTerm.length > 0}
  <SidebarUnit>
    <h3><Tr t={t.locations} /></h3>

    {#if $results?.length > 0}
      {#each $results as entry (entry)}
        <GeocodeResultSvelte on:select {entry} {state} />
      {/each}
    {/if}

    {#if $isSearching}
      <div class="m-4 my-8 flex justify-center">
        <Loading>
          <Tr t={t.searching} />
        </Loading>
      </div>
    {/if}

    {#if !$isSearching && $results.length === 0}
      <b class="flex justify-center p-4">
        <Tr t={t.nothingFor.Subs({ term: "<i>" + $searchTerm + "</i>" })} />
      </b>
    {/if}
  </SidebarUnit>
{:else if $recentlySeen?.length > 0}
  <SidebarUnit>
    <div class="flex justify-between">
      <h3 class="m-2">
        <Tr t={t.recents} />
      </h3>
      <DotMenu>
        <button
          on:click={() => {
            state.userRelatedState.recentlyVisitedSearch.clear()
          }}
        >
          <TrashIcon />
          <Tr t={t.deleteSearchHistory} />
        </button>
        <button on:click={() => state.guistate.openUsersettings("sync-visited-locations")}>
          <CogIcon />
          <Tr t={t.editSearchSyncSettings} />
        </button>
      </DotMenu>
    </div>
    {#each $recentlySeen as entry (entry)}
      <GeocodeResultSvelte {entry} {state} on:select />
    {/each}
  </SidebarUnit>
{/if}
