<script lang="ts">
  /**
   * The OverlayToggle shows a single toggle to enable or disable an overlay
   */
  import Checkbox from "../Base/Checkbox.svelte"
  import { onDestroy } from "svelte"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import { Translation } from "../i18n/Translation"
  import type { RasterLayerProperties } from "../../Models/RasterLayerProperties"

  export let layerproperties: RasterLayerProperties
  export let state: { isDisplayed: UIEventSource<boolean> }
  export let zoomlevel: UIEventSource<number>
  export let highlightedLayer: UIEventSource<string> | undefined

  let isDisplayed: boolean = state.isDisplayed.data
  onDestroy(
    state.isDisplayed.addCallbackAndRunD((d) => {
      isDisplayed = d
      return false
    })
  )

  let mainElem: HTMLElement
  $: onDestroy(
    highlightedLayer.addCallbackAndRun((highlightedLayer) => {
      if (highlightedLayer === layerproperties.id) {
        mainElem?.classList?.add("focus")
      } else {
        mainElem?.classList?.remove("focus")
      }
    })
  )
</script>

{#if layerproperties.name}
  <div bind:this={mainElem}>
    <label class="flex gap-1">
      <Checkbox selected={state.isDisplayed} />
      <Tr t={new Translation(layerproperties.name)} />
      {#if $zoomlevel < layerproperties.min_zoom}
        <span class="alert">
          <Tr t={Translations.t.general.layerSelection.zoomInToSeeThisLayer} />
        </span>
      {/if}
    </label>
  </div>
{/if}
