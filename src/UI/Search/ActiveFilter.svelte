<script lang="ts">
  import type { ActiveFilter } from "../../Logic/State/LayerState"
  import Tr from "../Base/Tr.svelte"
  import Icon from "../Map/Icon.svelte"
  import { Badge } from "flowbite-svelte"
  import FilterOption from "./FilterOption.svelte"
  import { XMarkIcon } from "@babeard/svelte-heroicons/mini"


  export let activeFilter: ActiveFilter
  let { control, layer, filter } = activeFilter
  let option = control.map(c => filter.options[c] ?? filter.options[0])
</script>
<div class="badge">
  <FilterOption option={$option} />
  <button on:click={() => control.setData(undefined)}>

    <XMarkIcon class="w-5 h-5 pl-1" color="gray" />
  </button>
</div>
