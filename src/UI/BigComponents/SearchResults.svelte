<script lang="ts">
  import type { GeoCodeResult } from "../../Logic/Geocoding/GeocodingProvider"
  import SearchResult from "./SearchResult.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { XMarkIcon } from "@babeard/svelte-heroicons/solid"
  import { Store } from "../../Logic/UIEventSource"
  import Loading from "../Base/Loading.svelte"

  export let state: SpecialVisualizationState
  export let results: GeoCodeResult[]
  export let searchTerm: Store<string>
  export let isFocused: Store<boolean>

  let recentlySeen: Store<GeoCodeResult[]> = state.recentlySearched.seenThisSession
</script>

<div class="w-full collapsable" style="height: 50rem;" class:collapsed={!$isFocused}>
  {#if $searchTerm.length > 0 && results === undefined}
    <div class="searchbox normal-background items-center">
      <Loading />
    </div>
  {:else if results?.length > 0}
    <div class="relative w-full h-full">
      <div class="absolute top-0 right-0 searchbox normal-background"
           style="width: 25rem">
        <div style="max-height: calc(50vh - 1rem - 2px);" class="overflow-y-auto">

          {#each results as entry (entry)}
            <SearchResult on:select {entry} {state} />
          {/each}
        </div>
      </div>


      <div class="absolute top-2 right-2 cursor-pointer" on:click={() => close()}>
        <XMarkIcon class="w-4 h-4 hover:bg-stone-200 rounded-full" />
      </div>
    </div>
  {:else }

      <div class="searchbox normal-background ">
    {#if $searchTerm.length > 0}
      <!-- TODO add translation -->
        <b class="flex justify-center p-4">No results found for {$searchTerm}</b>
    {/if}

    {#if $recentlySeen?.length > 0}
      <!-- TODO add translation -->
        <h4>Recent searches</h4>
        {#each $recentlySeen as entry}
          <SearchResult {entry} {state} on:select />
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
        transition: max-height 350ms ease-in-out;
        overflow: hidden;
        padding: 0 !important;
    }

    .collapsed {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        max-height: 0 !important;
    }
</style>
