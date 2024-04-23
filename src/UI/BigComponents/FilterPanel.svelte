<script lang="ts">
  /**
   * THe panel containing all filter- and layerselection options
   */

  import OverlayToggle from "./OverlayToggle.svelte"
  import Filterview from "./Filterview.svelte"
  import ThemeViewState from "../../Models/ThemeViewState"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import Filter from "../../assets/svg/Filter.svelte"
  import { EyeIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { trapFocus } from "trap-focus-svelte"

  export let state: ThemeViewState
  let layout = state.layout

  let allEnabled: boolean
  let allDisabled: boolean

  function updateEnableState() {
    allEnabled = true
    allDisabled = true
    state.layerState.filteredLayers.forEach((v) => {
      if (!v.layerDef.name) {
        return
      }
      allEnabled &&= v.isDisplayed.data
      allDisabled &&= !v.isDisplayed.data
    })
  }

  updateEnableState()
  state.layerState.filteredLayers.forEach((v) => {
    if (!v.layerDef.name) {
      return
    }
    v.isDisplayed.addCallbackD((_) => updateEnableState())
  })

  function enableAll(doEnable: boolean) {
    state.layerState.filteredLayers.forEach((v) => {
      if (!v.layerDef.name) {
        return
      }
      v.isDisplayed.setData(doEnable)
    })
  }
</script>

<div class="h-full flex flex-col">
  <h2 class="low-interaction m-0 flex items-center p-4 drop-shadow-md">
    <Filter class="h-6 w-6 pr-2" />
    <Tr t={Translations.t.general.menu.filter} />
  </h2>
  <div class="flex h-full flex-col overflow-auto p-4 border-b-2">
    {#each layout.layers as layer}
      <Filterview
        zoomlevel={state.mapProperties.zoom}
        filteredLayer={state.layerState.filteredLayers.get(layer.id)}
        highlightedLayer={state.guistate.highlightedLayerInFilters}
      />
    {/each}
    <div class="mt-1 flex self-end">
      <button class="small" class:disabled={allEnabled} on:click={() => enableAll(true)}>
        <Tr t={Translations.t.general.filterPanel.enableAll} />
      </button>
      <button class="small" class:disabled={allDisabled} on:click={() => enableAll(false)}>
        <Tr t={Translations.t.general.filterPanel.disableAll} />
      </button>
    </div>

    {#each layout.tileLayerSources as tilesource}
      <OverlayToggle
        layerproperties={tilesource}
        state={state.overlayLayerStates.get(tilesource.id)}
        highlightedLayer={state.guistate.highlightedLayerInFilters}
        zoomlevel={state.mapProperties.zoom}
      />
    {/each}
  </div>
</div>
