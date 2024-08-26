<script lang="ts">
  import type { ActiveFilter } from "../../Logic/State/LayerState"
  import { Badge } from "flowbite-svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import Tr from "../Base/Tr.svelte"

  export let state: SpecialVisualizationState

  export let activeFilter: ActiveFilter
  let { control, layer, filter } = activeFilter
  let option = control.map(c => {
    if (typeof c === "number") {
      return filter.options[c]
    }
    return filter.options[0]
  })
</script>
<Badge dismissable large border rounded color="dark" on:close={() =>{  console.log( "dismiss"); return control.setData(undefined) }}>
  <Tr cls="whitespace-nowrap" t={$option.question} />
</Badge>
