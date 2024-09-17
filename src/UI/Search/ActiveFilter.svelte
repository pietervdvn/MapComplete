<script lang="ts">
  import type { ActiveFilter } from "../../Logic/State/LayerState"
  import FilterOption from "./FilterOption.svelte"
  import Loading from "../Base/Loading.svelte"
  import FilterToggle from "./FilterToggle.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"


  export let activeFilter: ActiveFilter[]
  let { control, filter } = activeFilter[0]
  let option = control.map(c => filter.options[c] ?? filter.options[0])
  let loading = false

  function clear() {
    loading = true
    requestIdleCallback(() => {
      for (const af of activeFilter) {
        af.control.setData(undefined)
      }
      loading = false
    })
  }

  export let state: SpecialVisualizationState
  let debug = state.featureSwitches.featureSwitchIsDebugging
</script>
{#if loading}
  <Loading />
{:else }
  <FilterToggle on:click={() => clear()}>
    <FilterOption option={$option} />
    {#if $debug}
      <span class="subtle">
        ({activeFilter.map(af => af.layer.id).join(", ")})
      </span>
    {/if}
  </FilterToggle>
{/if}
