<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { Badge } from "flowbite-svelte"
  import ActiveFilter from "./ActiveFilter.svelte"

  export let state: SpecialVisualizationState

  let activeFilters = state.layerState.activeFilters


</script>
<div class="flex flex-wrap gap-y-1 gap-x-1 button-unstyled">

  {#each $activeFilters as activeFilter (activeFilter)}
    <ActiveFilter {activeFilter} {state} />
  {/each}
</div>
