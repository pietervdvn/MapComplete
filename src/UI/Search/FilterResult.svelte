<script lang="ts">
  import type FilterConfig from "../../Models/ThemeConfig/FilterConfig"
  import type { FilterConfigOption } from "../../Models/ThemeConfig/FilterConfig"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import Filter from "../../assets/svg/Filter.svelte"
  import Tr from "../Base/Tr.svelte"
  import type { FilterPayload } from "../../Logic/Geocoding/GeocodingProvider"
  import { createEventDispatcher } from "svelte"
  import { FilterIcon as FilterSolid } from "@rgossiaux/svelte-heroicons/solid"
  import { FilterIcon as FilterOutline } from "@rgossiaux/svelte-heroicons/outline"

  export let entry: {
    category: "filter",
    payload: FilterPayload
  }
  let { option, filter, layer, index } = entry.payload
  export let state: SpecialVisualizationState
  let dispatch = createEventDispatcher<{ select }>()

  let flayer = state.layerState.filteredLayers.get(layer.id)
  let filtercontrol = flayer.appliedFilters.get(filter.id)
  let isActive = filtercontrol.map(c => c === index)

  function apply() {

    for (const [name, otherLayer] of state.layerState.filteredLayers) {
      if(name === layer.id){
        otherLayer.isDisplayed.setData(true)
        continue
      }
      otherLayer.isDisplayed.setData(false)
    }

    if(filtercontrol.data === index){
      filtercontrol.setData(undefined)
    }else{
      filtercontrol.setData(index)
    }
    dispatch("select")


  }
</script>
<button on:click={() => apply()}>
  {#if $isActive}
    <FilterSolid class="w-8 h-8 shrink-0" />
  {:else}
    <FilterOutline class="w-8 h-8 shrink-0" />
  {/if}
  <Tr t={option.question} />
  <div class="subtle">
    {layer.id}
  </div>
</button>
