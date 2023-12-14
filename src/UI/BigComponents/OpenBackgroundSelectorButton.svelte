<script lang="ts">
  /**
   * A mapcontrol button which allows the user to select a different background.
   * Even though the componenet is very small, it gets it's own class as it is often reused
   */
  import { Square3Stack3dIcon } from "@babeard/svelte-heroicons/solid"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import Translations from "../i18n/Translations"
  import MapControlButton from "../Base/MapControlButton.svelte"
  import Tr from "../Base/Tr.svelte"

  export let state: SpecialVisualizationState
  export let hideTooltip = false
</script>

<MapControlButton arialabel={Translations.t.general.labels.background}
                  on:click={() => state.guistate.backgroundLayerSelectionIsOpened.setData(true)}>
  <Square3Stack3dIcon class="h-6 w-6" />
  {#if !hideTooltip}
    <Tr cls="mx-2" t={Translations.t.general.backgroundSwitch} />
  {/if}
</MapControlButton>
