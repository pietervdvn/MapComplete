<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import Translations from "../i18n/Translations"
  import Tr from "./Tr.svelte"
  import Josm_logo from "../../assets/svg/Josm_logo.svelte"
  import Constants from "../../Models/Constants"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { Utils } from "../../Utils"

  export let state: SpecialVisualizationState
  const t = Translations.t.general.attribution
  const josmState = new UIEventSource<"OK" | string>(undefined)
  // Reset after 15s
  josmState.stabilized(15000).addCallbackD(() => josmState.setData(undefined))

  const showButton = state.osmConnection.userDetails.map(
    (ud) => ud.loggedIn && ud.csCount >= Constants.userJourney.historyLinkVisible
  )

  function openJosm() {
    const bbox = state.mapProperties.bounds.data
    if (bbox === undefined) {
      return
    }
    const top = bbox.getNorth()
    const bottom = bbox.getSouth()
    const right = bbox.getEast()
    const left = bbox.getWest()
    const josmLink = `http://127.0.0.1:8111/load_and_zoom?left=${left}&right=${right}&top=${top}&bottom=${bottom}`
    Utils.download(josmLink)
      .then((answer) => josmState.setData(answer.replace(/\n/g, "").trim()))
      .catch(() => josmState.setData("ERROR"))
  }
</script>

{#if $showButton}
  <div class="flex">
    <button class="small soft flex grow items-center" on:click={openJosm}>
      <Josm_logo class="h-6 w-6 pr-2" />
      <Tr t={t.editJosm} />
    </button>

    {#if $josmState === undefined}
      <!-- empty -->
    {:else if $josmState === "OK"}
      <Tr cls="thanks shrink-0 w-fit" t={t.josmOpened} />
    {:else}
      <Tr cls="alert shrink-0 w-fit" t={t.josmNotOpened} />
    {/if}
  </div>
{/if}
