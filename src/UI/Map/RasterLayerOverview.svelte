<script lang="ts">
  /**
   * The RasterLayerOverview shows the available 4 categories of maps with a RasterLayerPicker
   */
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import type { RasterLayerPolygon } from "../../Models/RasterLayers"
  import type { MapProperties } from "../../Models/MapProperties"
  import { Map as MlMap } from "maplibre-gl"
  import RasterLayerPicker from "./RasterLayerPicker.svelte"
  import type { EliCategory } from "../../Models/RasterLayerProperties"
  import UserRelatedState from "../../Logic/State/UserRelatedState"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import { MenuState } from "../../Models/MenuState"
  import OverlayOverview from "./OverlayOverview.svelte"
  import TitledPanel from "../Base/TitledPanel.svelte"
  import Loading from "../Base/Loading.svelte"

  export let availableLayers: { store: Store<RasterLayerPolygon[]> }
  export let mapproperties: MapProperties
  export let userstate: UserRelatedState
  export let map: Store<MlMap>
  export let menuState: MenuState
  let _availableLayers = availableLayers.store
  /**
   * Used to toggle the background layers on/off
   */
  export let visible: UIEventSource<boolean> = undefined
  /**
   * This can be either "background" or "overlay"
   */
  export let layerType: "background" | "overlay" = "background"

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
    visible.setData(false)
  }

  function getPref(type: CategoryType): undefined | UIEventSource<string> {
    return userstate?.osmConnection?.GetPreference("preferred-layer-" + type)
  }

  function openOverlaySelector() {
    menuState.backgroundLayerSelectionIsOpened.setData(false)
    menuState.overlaySelectionIsOpened.setData(true)
  }
</script>

<TitledPanel>
  {#if layerType == "background"}
    <Tr t={Translations.t.general.backgroundMap} slot="title" />
  {:else}
    <Tr t={Translations.t.general.overlayMap} slot="title" />
  {/if}
  {#if $_availableLayers?.length < 1}
    <Loading />
  {:else}
    {#if layerType == "background"}
      // TODO: Handle enter keypress
      <button
        on:click={() => {
          openOverlaySelector()
        }}
      >
        <Tr t={Translations.t.general.overlayMap} />
      </button>
    {:else}
      <OverlayOverview {mapproperties} />
    {/if}

    <div class="grid h-full w-full grid-cols-1 gap-2 md:grid-cols-2">
      <RasterLayerPicker
        availableLayers={$photoLayers}
        favourite={getPref("photo")}
        {map}
        {mapproperties}
        on:appliedLayer={onApply}
        {visible}
      />
      <RasterLayerPicker
        availableLayers={$mapLayers}
        favourite={getPref("map")}
        {map}
        {mapproperties}
        on:appliedLayer={onApply}
        {visible}
      />
      <RasterLayerPicker
        availableLayers={$osmbasedmapLayers}
        favourite={getPref("osmbasedmap")}
        {map}
        {mapproperties}
        on:appliedLayer={onApply}
        {visible}
      />
      <RasterLayerPicker
        availableLayers={$otherLayers}
        favourite={getPref("other")}
        {map}
        {mapproperties}
        on:appliedLayer={onApply}
        {visible}
      />
    </div>
  {/if}
  </TitledPanel>
