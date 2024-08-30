<script lang="ts">
  import { default as ActiveFilterSvelte } from "./ActiveFilter.svelte"
  import type { ActiveFilter } from "../../Logic/State/LayerState"
  import Loading from "../Base/Loading.svelte"

  export let activeFilters: ActiveFilter[]
  let loading = false

  function clear() {
    loading = true
    requestIdleCallback(() => {

      for (const activeFilter of activeFilters) {
        activeFilter.control.setData(undefined)
      }
      loading = false
    })
  }
</script>
{#if activeFilters.length > 0}
  <div class="flex flex-wrap gap-y-1 gap-x-1 button-unstyled">
    <h3>Active filters</h3>

    {#if loading}
      <Loading />
    {:else}
      {#each activeFilters as activeFilter (activeFilter)}
        <ActiveFilterSvelte {activeFilter} />
      {/each}

      <button class="as-link subtle" on:click={() => clear()}>
        Clear filters
      </button>
    {/if}
  </div>

{/if}
