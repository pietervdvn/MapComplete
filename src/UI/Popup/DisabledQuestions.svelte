<script lang="ts">
  import DisabledQuestionsLayer from "./DisabledQuestionsLayer.svelte"
  import { Stores } from "../../Logic/UIEventSource"

  /**
   * Shows _all_ disabled questions
   */
  export let state
  let layers = state.layout.layers.filter(l => l.isNormal())

  let allDisabled = Stores.concat<string>(layers.map(l => state.userRelatedState.getThemeDisabled(state.layout.id, l.id))).map(l => [].concat(...l))

</script>

<h3>Disabled questions</h3>
{#if $allDisabled.length === 0}
  To disable a question, click the three dots in the upper-right corner
{:else}
  To enable a question again, click it
  {#each layers as layer (layer.id)}
    <DisabledQuestionsLayer {state} {layer} />
  {/each}
{/if}
