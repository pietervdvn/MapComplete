<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { OsmTags } from "../../Models/OsmFeature"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import type { P4CPicture } from "../../Logic/Web/NearbyImagesSearch"
  import AllImageProviders from "../../Logic/ImageProviders/AllImageProviders"
  import LinkImageAction from "../../Logic/Osm/Actions/LinkImageAction"
  import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction"
  import { Tag } from "../../Logic/Tags/Tag"
  import type { Feature } from "geojson"
  import Translations from "../i18n/Translations"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import type { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"
  import AttributedImage from "./AttributedImage.svelte"
  import SpecialTranslation from "../Popup/TagRendering/SpecialTranslation.svelte"

  export let tags: UIEventSource<OsmTags>
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
  const providedImage: ProvidedImage = {
    url: image.thumbUrl ?? image.pictureUrl,
    key: undefined,
    provider: AllImageProviders.byName(image.provider),
    date: new Date(image.date),
    id: Object.values(image.osmTags)[0],
  }

  $: {
    const currentTags = tags.data
    const key = Object.keys(image.osmTags)[0]
    const url = image.osmTags[key]
    if (isLinked) {
      const action = new LinkImageAction(currentTags.id, key, url, tags, {
        theme: tags.data._orig_theme ?? state.layout.id,
        changeType: "link-image",
      })
      state.changes.applyAction(action)
    } else {
      for (const k in currentTags) {
        const v = currentTags[k]
        if (v === url) {
          const action = new ChangeTagAction(currentTags.id, new Tag(k, ""), currentTags, {
            theme: tags.data._orig_theme ?? state.layout.id,
            changeType: "remove-image",
          })
          state.changes.applyAction(action)
        }
      }
    }
  }
</script>

<div class="flex w-fit shrink-0 flex-col">
  <div class="cursor-zoom-in" on:click={() => state.previewedImage.setData(providedImage)}>
    <AttributedImage
      image={providedImage}
      imgClass="max-h-64 w-auto"
      previewedImage={state.previewedImage}
    />
  </div>
  {#if linkable}
    <label>
      <input bind:checked={isLinked} type="checkbox" />
      <SpecialTranslation t={t.link} {tags} {state} {layer} {feature} />
    </label>
  {/if}
</div>
