<script lang="ts">
  /**
   * Show the list of options to choose from
   */
  import type { PlantNetSpeciesMatch } from "../../Logic/Web/PlantNet"
  import { Store } from "../../Logic/UIEventSource"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import Loading from "../Base/Loading.svelte"
  import SpeciesButton from "./SpeciesButton.svelte"

  const t = Translations.t.plantDetection

  export let options: Store<PlantNetSpeciesMatch[]>
  export let numberOfImages: number
</script>

{#if $options === undefined}
  <Loading>
    <Tr t={t.querying.Subs({ length: numberOfImages })} />
  </Loading>
{:else}
  <div class="low-interaction border-interactive relative flex flex-col p-2">
    <div class="absolute top-0 right-0">
      <slot name="upper-right" />
    </div>
    <h3>
      <Tr t={t.overviewTitle} />
    </h3>
    <Tr t={t.overviewIntro} />
    <Tr cls="font-bold" t={t.overviewVerify} />
    {#each $options as species}
      <SpeciesButton {species} on:selected />
    {/each}
  </div>
{/if}
