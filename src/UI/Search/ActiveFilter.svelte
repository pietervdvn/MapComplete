<script lang="ts">
  import type { ActiveFilter } from "../../Logic/State/LayerState"
  import FilterOption from "./FilterOption.svelte"
  import Loading from "../Base/Loading.svelte"
  import FilterToggle from "./FilterToggle.svelte"


  export let activeFilter: ActiveFilter
  let { control, filter } = activeFilter
  let option = control.map(c => filter.options[c] ?? filter.options[0])
  let loading = false

  function clear() {
    loading = true
    requestIdleCallback(() => {
      control.setData(undefined)
      loading = false
    })
  }
</script>
{#if loading}
  <Loading />
{:else }
  <FilterToggle  on:click={() => clear()}>
    <FilterOption option={$option} />
  </FilterToggle>
{/if}
