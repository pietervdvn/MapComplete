<script lang="ts">
  /**
   * A mapcontrol button which allows the user to select a different background.
   * Even though the component is very small, it gets its own class as it is often reused
   */
  import { Square3Stack3dIcon } from "@babeard/svelte-heroicons/solid"
  import Translations from "../i18n/Translations"
  import MapControlButton from "../Base/MapControlButton.svelte"
  import Tr from "../Base/Tr.svelte"
  import StyleLoadingIndicator from "../Map/StyleLoadingIndicator.svelte"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import { Map as MlMap } from "maplibre-gl"
  import ThemeViewState from "../../Models/ThemeViewState"

  export let state: ThemeViewState
  export let map: Store<MlMap> = undefined
  export let hideTooltip = false
  export let htmlElem : UIEventSource<HTMLElement> = undefined
</script>

<MapControlButton
  arialabel={Translations.t.general.labels.background}
  on:click={() => state.guistate.backgroundLayerSelectionIsOpened.setData(true)}
  {htmlElem}
>
  <StyleLoadingIndicator map={map ?? state.map} rasterLayer={state.mapProperties.rasterLayer}>
    <Square3Stack3dIcon class="h-6 w-6" />
  </StyleLoadingIndicator>
  {#if !hideTooltip}
    <Tr cls="mx-2" t={Translations.t.general.backgroundSwitch} />
  {/if}
</MapControlButton>
