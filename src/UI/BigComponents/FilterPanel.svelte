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

  export let state: ThemeViewState
  let layout = state.layout
</script>

<div class="m-2 flex flex-col">
  <h2 class="flex items-center">
    <Filter class="h-6 w-6 pr-2" />
    <Tr t={Translations.t.general.menu.filter} />
  </h2>

  {#each layout.layers as layer}
    <Filterview
      zoomlevel={state.mapProperties.zoom}
      filteredLayer={state.layerState.filteredLayers.get(layer.id)}
      highlightedLayer={state.guistate.highlightedLayerInFilters}
    />
  {/each}
  {#each layout.tileLayerSources as tilesource}
    <OverlayToggle
      layerproperties={tilesource}
      state={state.overlayLayerStates.get(tilesource.id)}
      highlightedLayer={state.guistate.highlightedLayerInFilters}
      zoomlevel={state.mapProperties.zoom}
    />
  {/each}
</div>
