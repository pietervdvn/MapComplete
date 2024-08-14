<script lang="ts">
  import type { GeoCodeResult } from "../../Logic/Geocoding/GeocodingProvider"
  import SearchResult from "./SearchResult.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { XMarkIcon } from "@babeard/svelte-heroicons/solid"

  export let state: SpecialVisualizationState
  export let results: GeoCodeResult[]

  function close(){
    results = []
  }
</script>

{#if results.length > 0}
  <div class="relative w-full">

    <div class="absolute top-0 left-0 flex flex-col gap-y-2 normal-background p-2 rounded-xl border border-black w-full">
      {#each results as entry (entry)}
        <SearchResult on:select={() => close()} {entry} {state} />
      {/each}
    </div>
    <div class="absolute top-2 right-2" on:click={() => close()}>
      <XMarkIcon class="w-4 h-4 hover:bg-stone-200 rounded-full" />
    </div>
  </div>
{/if}
