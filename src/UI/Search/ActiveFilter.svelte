<script lang="ts">
  import type { ActiveFilter } from "../../Logic/State/LayerState"
  import FilterOption from "./FilterOption.svelte"
  import { XMarkIcon } from "@babeard/svelte-heroicons/mini"
  import Loading from "../Base/Loading.svelte"


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
  <div class="badge button-unstyled w-fit">
    <FilterOption option={$option} />
    <button on:click={() => clear()}>
      <XMarkIcon class="w-5 h-5 pl-1" color="gray" />
    </button>
  </div>
{/if}
