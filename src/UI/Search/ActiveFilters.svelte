<script lang="ts">
  import { default as ActiveFilterSvelte } from "./ActiveFilter.svelte"
  import type { ActiveFilter } from "../../Logic/State/LayerState"

  export let activeFilters: ActiveFilter[]

  function clear() {
    for (const activeFilter of activeFilters) {
      activeFilter.control.setData(undefined)
    }
  }
</script>
{#if activeFilters.length > 0}
  <div class="flex flex-wrap gap-y-1 gap-x-1 button-unstyled">
    {#each activeFilters as activeFilter (activeFilter)}
      <ActiveFilterSvelte {activeFilter} />
    {/each}

    <button class="as-link subtle" on:click={() => clear()}>
      Clear filters
    </button>
  </div>

{/if}
