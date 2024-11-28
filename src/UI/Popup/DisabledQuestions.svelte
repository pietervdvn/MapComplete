<script lang="ts">
  import DisabledQuestionsLayer from "./DisabledQuestionsLayer.svelte"
  import { Stores } from "../../Logic/UIEventSource"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"

  /**
   * Shows _all_ disabled questions
   */
  export let state
  let layers = state.layout.layers.filter((l) => l.isNormal())

  let allDisabled = Stores.concat<string>(
    layers.map((l) => state.userRelatedState.getThemeDisabled(state.layout.id, l.id))
  ).map((l) => [].concat(...l))
  const t = Translations.t.general.questions
</script>

<h3>
  <Tr t={t.disabledTitle} />
</h3>
{#if $allDisabled.length === 0}
  <Tr t={t.noneDisabled} />
{:else}
  <Tr t={t.disabledIntro} />
  {#each layers as layer (layer.id)}
    <DisabledQuestionsLayer {state} {layer} />
  {/each}
{/if}
