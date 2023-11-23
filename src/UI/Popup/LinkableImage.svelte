<script lang="ts">
  import { Store } from "../../Logic/UIEventSource"
  import type { OsmTags } from "../../Models/OsmFeature"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import type { P4CPicture } from "../../Logic/Web/NearbyImagesSearch"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import { AttributedImage } from "../Image/AttributedImage"
  import AllImageProviders from "../../Logic/ImageProviders/AllImageProviders"
  import LinkImageAction from "../../Logic/Osm/Actions/LinkImageAction"
  import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction"
  import { Tag } from "../../Logic/Tags/Tag"
  import { GeoOperations } from "../../Logic/GeoOperations"
  import type { Feature } from "geojson"
  import Translations from "../i18n/Translations"
  import SpecialTranslation from "./TagRendering/SpecialTranslation.svelte"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"

  export let tags: Store<OsmTags>
  export let lon: number
  export let lat: number
  export let state: SpecialVisualizationState
  export let image: P4CPicture
  export let feature: Feature
  export let layer: LayerConfig

  export let linkable = true
  let isLinked = Object.values(tags.data).some((v) => image.pictureUrl === v)

  const t = Translations.t.image.nearby
  const c = [lon, lat]
  let attributedImage = new AttributedImage({
    url: image.thumbUrl ?? image.pictureUrl,
    provider: AllImageProviders.byName(image.provider),
    date: new Date(image.date),
  })
  let distance = Math.round(
    GeoOperations.distanceBetween([image.coordinates.lng, image.coordinates.lat], c)
  )

  $: {
    const currentTags = tags.data
    const key = Object.keys(image.osmTags)[0]
    const url = image.osmTags[key]
    if (isLinked) {
      const action = new LinkImageAction(currentTags.id, key, url, tags, {
        theme: state.layout.id,
        changeType: "link-image",
      })
      state.changes.applyAction(action)
    } else {
      for (const k in currentTags) {
        const v = currentTags[k]
        if (v === url) {
          const action = new ChangeTagAction(currentTags.id, new Tag(k, ""), currentTags, {
            theme: state.layout.id,
            changeType: "remove-image",
          })
          state.changes.applyAction(action)
        }
      }
    }
  }
</script>

<div class="flex w-fit shrink-0 flex-col">
  <ToSvelte construct={attributedImage.SetClass("h-48 w-fit")} />
  {#if linkable}
    <label>
      <input bind:checked={isLinked} type="checkbox" />
      <SpecialTranslation t={t.link} {tags} {state} {layer} {feature} />
    </label>
  {/if}
</div>
