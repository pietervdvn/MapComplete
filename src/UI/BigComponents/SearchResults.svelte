<script lang="ts">
  import type { GeoCodeResult } from "../../Logic/Geocoding/GeocodingProvider"
  import SearchResult from "./SearchResult.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { XMarkIcon } from "@babeard/svelte-heroicons/solid"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import Loading from "../Base/Loading.svelte"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import MoreScreen from "./MoreScreen"

  export let state: SpecialVisualizationState
  export let results: { success: GeoCodeResult[] } | { error }
  export let searchTerm: Store<string>
  export let isFocused: UIEventSource<boolean>

  let recentlySeen: Store<GeoCodeResult[]> = state.recentlySearched.seenThisSession
  let recentThemes = state.userRelatedState.recentlyVisitedThemes.mapD(thms => thms.filter(th => th !== state.layout.id).slice(0, 3))
  let allowOtherThemes = state.featureSwitches.featureSwitchBackToThemeOverview
</script>

<div class="w-full collapsable" style="height: 50rem;" class:collapsed={!$isFocused}>
  {#if results?.["error"] !== undefined}
    <div class="searchbox normal-background items-center">
      An error occured
    </div>

  {:else if $searchTerm.length > 0 && results === undefined}
    <div class="searchbox normal-background items-center">
      <Loading />
    </div>
  {:else if results?.["success"]?.length > 0}
    <div class="relative w-full h-full">
      <div class="absolute top-0 right-0 searchbox normal-background"
           style="width: 25rem">
        <div style="max-height: calc(50vh - 1rem - 2px);" class="overflow-y-auto">

          {#each results["success"] as entry (entry)}
            <SearchResult on:select {entry} {state} />
          {/each}
        </div>
      </div>


      <div class="absolute top-2 right-2 cursor-pointer" on:click={() => isFocused.setData(false)}>
        <XMarkIcon class="w-4 h-4 hover:bg-stone-200 rounded-full" />
      </div>
    </div>
  {:else if $searchTerm.length > 0 || $recentlySeen?.length > 0 || $recentThemes?.length > 0}

    <div class="searchbox normal-background overflow-y-auto h-full">
      {#if $searchTerm.length > 0}
        <b class="flex justify-center p-4">
          <Tr t={Translations.t.general.search.nothingFor.Subs({term: $searchTerm})} />
        </b>
      {/if}

      {#if $recentlySeen?.length > 0}
        <h3 class="mx-2">
          <Tr t={Translations.t.general.search.recents} />
        </h3>
        {#each $recentlySeen as entry}
          <SearchResult {entry} {state} on:select />
        {/each}
      {/if}

      {#if $recentThemes?.length > 0 && $allowOtherThemes}
        <h3 class="mx-2">
          <Tr t={Translations.t.general.search.recentThemes} />
        </h3>
        {#each $recentThemes as themeId (themeId)}
          <SearchResult
            entry={{payload: MoreScreen.officialThemesById.get(themeId), display_name: themeId, lat: 0, lon: 0}} {state}
            on:select />
        {/each}
      {/if}
    </div>
  {/if}
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
        transition-delay: 500ms;
        overflow: hidden;
        padding: 0 !important;
    }

    .collapsed {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        max-height: 0 !important;
    }
</style>
