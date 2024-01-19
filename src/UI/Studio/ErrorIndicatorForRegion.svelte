<script lang="ts">
  import EditLayerState from "./EditLayerState"
  import { ExclamationIcon } from "@rgossiaux/svelte-heroicons/solid"

  export let firstPaths: Set<string | number>
  export let state: EditLayerState
  let messagesCount = state.messages.map(
    (msgs) =>
      msgs.filter((msg) => {
        const pth = msg.context.path
        return firstPaths.has(pth[0]) || (pth.length > 1 && firstPaths.has(pth[1]))
      }).length
  )
</script>

{#if $messagesCount > 0}
  <span class="alert flex w-min">
    <ExclamationIcon class="h-6 w-6" />
    {$messagesCount}
  </span>
{/if}
