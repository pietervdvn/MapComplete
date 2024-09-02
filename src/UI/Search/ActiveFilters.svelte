<script lang="ts">
  import { default as ActiveFilterSvelte } from "./ActiveFilter.svelte"
  import type { ActiveFilter } from "../../Logic/State/LayerState"
  import Loading from "../Base/Loading.svelte"
  import SidebarUnit from "../Base/SidebarUnit.svelte"

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
  <SidebarUnit>
    <h3>Active filters</h3>

    {#if loading}
      <Loading />
    {:else}
      <div class="flex flex-wrap gap-x-1 gap-y-2">

      {#each activeFilters as activeFilter (activeFilter)}
        <div>
        <ActiveFilterSvelte {activeFilter} />
        </div>
      {/each}
      </div>

      <button class="as-link subtle self-end" on:click={() => clear()} style="margin-right: 0.75rem">
        Clear filters
      </button>
    {/if}
  </SidebarUnit>

{/if}
