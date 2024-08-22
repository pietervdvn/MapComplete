<script lang="ts">
  import type { GeoCodeResult } from "../../Logic/Geocoding/GeocodingProvider"
  import SearchResult from "./SearchResult.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import Loading from "../Base/Loading.svelte"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import MoreScreen from "./MoreScreen"
  import { XCircleIcon } from "@babeard/svelte-heroicons/solid"

  export let state: SpecialVisualizationState
  export let results: GeoCodeResult[]
  export let searchTerm: Store<string>
  export let isFocused: UIEventSource<boolean>

  let recentlySeen: Store<GeoCodeResult[]> = state.recentlySearched.seenThisSession
  let recentThemes = state.userRelatedState.recentlyVisitedThemes.mapD(thms => thms.filter(th => th !== state.layout.id).slice(0, 3))
  let allowOtherThemes = state.featureSwitches.featureSwitchBackToThemeOverview
</script>

<div class="relative w-full h-full collapsable " class:collapsed={!$isFocused}>
  <button class="absolute right-0 top-0 border-none p-0" on:click={() => isFocused.setData(false)} tabindex="-1">
    <XCircleIcon class="w-6 h-6" />
  </button>

  <div class="searchbox normal-background">

    {#if $searchTerm.length > 0 && results === undefined}
      <div class="flex justify-center m-4 my-8">
        <Loading />
      </div>
    {:else if results?.length > 0}
      <div style="max-height: calc(50vh - 1rem - 2px);" class="overflow-y-auto p-2" tabindex="-1">

        {#each results as entry (entry)}
          <SearchResult on:select {entry} {state} />
        {/each}
      </div>
    {:else if $searchTerm.length > 0 || $recentlySeen?.length > 0 || $recentThemes?.length > 0}
      <div style="max-height: calc(50vh - 1rem - 2px);" class="overflow-y-auto p-2 flex flex-col gap-y-8" tabindex="-1">
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
              <SearchResult {entry} {state} on:select />
            {/each}
          </div>
        {/if}

        {#if $recentThemes?.length > 0 && $allowOtherThemes}
          <div>
            <h3 class="m-2">
              <Tr t={Translations.t.general.search.recentThemes} />
            </h3>
            {#each $recentThemes as themeId (themeId)}
              <SearchResult
                entry={{payload: MoreScreen.officialThemesById.get(themeId), display_name: themeId, lat: 0, lon: 0}}
                {state}
                on:select />
            {/each}
          </div>
        {/if}
      </div>
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
