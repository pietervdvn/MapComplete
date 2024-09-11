<script lang="ts">
  import { default as ActiveFilterSvelte } from "./ActiveFilter.svelte"
  import type { ActiveFilter } from "../../Logic/State/LayerState"
  import Loading from "../Base/Loading.svelte"
  import SidebarUnit from "../Base/SidebarUnit.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import FilteredLayer from "../../Models/FilteredLayer"
  import FilterToggle from "./FilterToggle.svelte"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import Tr from "../Base/Tr.svelte"
  import { Store } from "../../Logic/UIEventSource"
  import Translations from "../i18n/Translations"

  export let activeFilters: ActiveFilter[]
  export let state: SpecialVisualizationState
  let loading = false
  const t =Translations.t.general.search


  let activeLayers: Store<FilteredLayer[]> = state.layerState.activeLayers.mapD(l => l.filter(l => l.layerDef.isNormal()))
  let nonactiveLayers: Store<FilteredLayer[]> = state.layerState.nonactiveLayers.mapD(l => l.filter(l => l.layerDef.isNormal()))

  function enableAllLayers() {
    for (const flayer of $nonactiveLayers) {
      flayer.isDisplayed.set(true)
    }
  }

  function clear() {
    loading = true
    requestIdleCallback(() => {
      enableAllLayers()


      for (const activeFilter of activeFilters) {
        activeFilter.control.setData(undefined)
      }
      loading = false
    })
  }
</script>

{#if activeFilters.length > 0 || $activeLayers.length === 1 || $nonactiveLayers.length > 0}
  <SidebarUnit>
    <div class="flex justify-between">
      <h3><Tr t={t.activeFilters}/></h3>

      <button class="as-link subtle self-end" on:click={() => clear()} style="margin-right: 0.75rem">
        <Tr t={t.clearFilters}/>
      </button>
    </div>
    {#if loading}
      <Loading />
    {:else}

      <div class="flex flex-wrap gap-x-1 gap-y-2 overflow-x-hidden overflow-y-auto">
        {#if $activeLayers.length === 1}
          <FilterToggle on:click={() => enableAllLayers()}>
            <div class="w-8 h-8 p-1">
              <ToSvelte construct={$activeLayers[0].layerDef.defaultIcon()} />
            </div>
            <b>
              <Tr t={$activeLayers[0].layerDef.name} />
            </b>
          </FilterToggle>
        {:else if $nonactiveLayers.length > 0}
          {#each $nonactiveLayers as nonActive (nonActive.layerDef.id)}
            <FilterToggle on:click={() => nonActive.isDisplayed.set(true)}>
              <div class="w-8 h-8 p-1">
                <ToSvelte construct={nonActive.layerDef.defaultIcon()} />
              </div>
              <del class="block-ruby">
                <Tr t={nonActive.layerDef.name} />
              </del>
            </FilterToggle>
          {/each}
        {/if}


        {#each activeFilters as activeFilter (activeFilter)}
          <div>
            <ActiveFilterSvelte {activeFilter} />
          </div>
        {/each}
      </div>
    {/if}
  </SidebarUnit>
{/if}
