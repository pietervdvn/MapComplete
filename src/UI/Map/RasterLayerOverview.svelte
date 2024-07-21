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
  import TitledPanel from "../Base/TitledPanel.svelte"

  export let availableLayers: Store<RasterLayerPolygon[]>
  export let mapproperties: MapProperties
  export let userstate: UserRelatedState
  export let map: Store<MlMap>
  /**
   * Used to toggle the background layers on/off
   */
  export let visible: UIEventSource<boolean> = undefined

  type CategoryType = "photo" | "map" | "other" | "osmbasedmap"
  const categories: Record<CategoryType, EliCategory[]> = {
    photo: ["photo", "historicphoto"],
    map: ["map", "historicmap"],
    other: ["other", "elevation"],
    osmbasedmap: ["osmbasedmap"],
  }

  function availableForCategory(type: CategoryType): Store<RasterLayerPolygon[]> {
    const keywords = categories[type]
    return availableLayers.mapD((available) =>
      available.filter((layer) => keywords.indexOf(<EliCategory>layer.properties.category) >= 0)
    )
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
</script>

<TitledPanel>
  <Tr slot="title" t={Translations.t.general.backgroundMap} />

  <div class="grid h-full w-full grid-cols-1 gap-2 md:grid-cols-2">
    <RasterLayerPicker
      availableLayers={photoLayers}
      favourite={getPref("photo")}
      {map}
      {mapproperties}
      on:appliedLayer={onApply}
      {visible}
    />
    <RasterLayerPicker
      availableLayers={mapLayers}
      favourite={getPref("map")}
      {map}
      {mapproperties}
      on:appliedLayer={onApply}
      {visible}
    />
    <RasterLayerPicker
      availableLayers={osmbasedmapLayers}
      favourite={getPref("osmbasedmap")}
      {map}
      {mapproperties}
      on:appliedLayer={onApply}
      {visible}
    />
    <RasterLayerPicker
      availableLayers={otherLayers}
      favourite={getPref("other")}
      {map}
      {mapproperties}
      on:appliedLayer={onApply}
      {visible}
    />
  </div>
</TitledPanel>
