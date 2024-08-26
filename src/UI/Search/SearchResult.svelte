<script lang="ts">
  import type { SearchResult } from "../../Logic/Geocoding/GeocodingProvider"

  import ThemeResult from "../Search/ThemeResult.svelte"
  import FilterResult from "./FilterResult.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import GeocodeResult from "./GeocodeResult.svelte"

  export let entry: SearchResult
  export let state: SpecialVisualizationState
</script>

{#if entry.category === "theme"}
  <ThemeResult {entry} />
{:else if entry.category === "filter"}
  <FilterResult {entry} {state} />
{:else}

  <GeocodeResult {entry} {state} />
{/if}
