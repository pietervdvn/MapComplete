<script lang="ts">
  /**
   * The RasterLayerOverview shows the available 4 categories of maps with a RasterLayerPicker
   */
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import type { RasterLayerPolygon } from "../../Models/RasterLayers"
  import RasterLayerPicker from "./RasterLayerPicker.svelte"
  import type { EliCategory } from "../../Models/RasterLayerProperties"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import Loading from "../Base/Loading.svelte"
  import Page from "../Base/Page.svelte"
  import ThemeViewState from "../../Models/ThemeViewState"
  import { Square3Stack3dIcon } from "@babeard/svelte-heroicons/solid"
  import OverlayOverview from "./OverlayOverview.svelte"

  export let state: ThemeViewState
  export let layerType: "background" | "overlay" = "background"

  let map = state.map
  let mapproperties = state.mapProperties
  let userstate = state.userRelatedState
  let shown =
    layerType === "background"
      ? state.guistate.pageStates.background
      : state.guistate.pageStates.overlay
  let availableLayers: { store: Store<RasterLayerPolygon[]> } = state.availableLayers
  let _availableLayers = availableLayers.store

  type CategoryType = "photo" | "map" | "other" | "osmbasedmap"
  const categories: Record<CategoryType, EliCategory[]> = {
    photo: ["photo", "historicphoto"],
    map: ["map", "historicmap"],
    other: ["other", "elevation"],
    osmbasedmap: ["osmbasedmap"],
  }

  function availableForCategory(type: CategoryType): Store<RasterLayerPolygon[]> {
    const keywords = categories[type]
    return _availableLayers.mapD((available) => {
      let output = available.filter(
        (layer) => keywords.indexOf(<EliCategory>layer.properties.category) >= 0
      )

      if (layerType === "background") {
        output = output.filter((layer) => layer.properties.isOverlay != true)
      } else {
        output = output.filter((layer) => layer.properties.isOverlay == true)
      }

      return output
    })
  }

  const mapLayers = availableForCategory("map")
  const osmbasedmapLayers = availableForCategory("osmbasedmap")
  const photoLayers = availableForCategory("photo")
  const otherLayers = availableForCategory("other")

  function onApply() {
    if (layerType === "background") {
      shown.setData(false)
    }
  }

  function getPref(type: CategoryType): undefined | UIEventSource<string> {
    return userstate?.osmConnection?.GetPreference("preferred-layer-" + type)
  }

  export let onlyLink: boolean

  let pickerStyleText =
    layerType === "background" ? "height: calc( 100% - 5rem)" : "height: calc( 80% - 5rem)"
</script>

<Page {onlyLink} {shown} fullscreen={true}>
  <div slot="header" class="flex">
    <Square3Stack3dIcon class="h-6 w-6" />

    {#if layerType === "background"}
      <Tr t={Translations.t.general.backgroundMap} />
    {:else}
      <Tr t={Translations.t.general.overlayMap} />
    {/if}
  </div>
  {#if $_availableLayers?.length < 1}
    <Loading />
  {:else}
    <div class="flex flex-col gap-x-2 gap-y-2 sm:flex-row" style={pickerStyleText}>
      <RasterLayerPicker
        availableLayers={$photoLayers}
        favourite={getPref("photo")}
        {map}
        {mapproperties}
        on:appliedLayer={onApply}
        {shown}
      />
      <RasterLayerPicker
        availableLayers={$mapLayers}
        favourite={getPref("map")}
        {map}
        {mapproperties}
        on:appliedLayer={onApply}
        {shown}
      />
      <RasterLayerPicker
        availableLayers={$osmbasedmapLayers}
        favourite={getPref("osmbasedmap")}
        {map}
        {mapproperties}
        on:appliedLayer={onApply}
        {shown}
      />
      <RasterLayerPicker
        availableLayers={$otherLayers}
        favourite={getPref("other")}
        {map}
        {mapproperties}
        on:appliedLayer={onApply}
        {shown}
      />
    </div>
    {#if layerType === "overlay"}
      <!-- TODO: Fix all styling issues here -->
      <div class="h-1/5"><OverlayOverview {mapproperties} /></div>
    {/if}
  {/if}
</Page>
