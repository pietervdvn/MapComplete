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

  export let state: ThemeViewState

  let map = state.map
  let mapproperties = state.mapProperties
  let userstate = state.userRelatedState
  let shown = state.guistate.pageStates.background
  let availableLayers: { store: Store<RasterLayerPolygon[]> } = state.availableLayers
  let _availableLayers = availableLayers.store

  type CategoryType = "photo" | "map" | "other" | "osmbasedmap"
  const categories: Record<CategoryType, EliCategory[]> = {
    photo: ["photo", "historicphoto"],
    map: ["map", "historicmap"],
    other: ["other", "elevation"],
    osmbasedmap: ["osmbasedmap"]
  }

  function availableForCategory(type: CategoryType): Store<RasterLayerPolygon[]> {
    const keywords = categories[type]
    return _availableLayers.mapD((available) =>
      available.filter((layer) => keywords.indexOf(<EliCategory>layer.properties.category) >= 0)
    )
  }

  const mapLayers = availableForCategory("map")
  const osmbasedmapLayers = availableForCategory("osmbasedmap")
  const photoLayers = availableForCategory("photo")
  const otherLayers = availableForCategory("other")

  function onApply() {
    shown.setData(false)
  }

  function getPref(type: CategoryType): undefined | UIEventSource<string> {
    return userstate?.osmConnection?.GetPreference("preferred-layer-" + type)
  }

  export let onlyLink: boolean

</script>

<Page {onlyLink} shown={shown} fullscreen={true}>
  <Tr slot="header" t={Translations.t.general.backgroundMap} />
  {#if $_availableLayers?.length < 1}
    <Loading />
  {:else}

    <div class="flex gap-x-2 flex-col sm:flex-row gap-y-2" style="height: calc( 100% - 5rem)">
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
  {/if}
</Page>
