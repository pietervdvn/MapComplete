<script lang="ts">
  /**
   * Show nearby images which can be clicked
   */
  import type { OsmTags } from "../../Models/OsmFeature"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import type { P4CPicture } from "../../Logic/Web/NearbyImagesSearch"
  import NearbyImagesSearch from "../../Logic/Web/NearbyImagesSearch"
  import LinkableImage from "./LinkableImage.svelte"
  import type { Feature } from "geojson"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import Loading from "../Base/Loading.svelte"
  import AllImageProviders from "../../Logic/ImageProviders/AllImageProviders"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import LoginToggle from "../Base/LoginToggle.svelte"

  export let tags: UIEventSource<OsmTags>
  export let state: SpecialVisualizationState
  export let lon: number
  export let lat: number
  export let feature: Feature

  export let linkable: boolean = true
  export let layer: LayerConfig

  let imagesProvider = new NearbyImagesSearch(
    {
      lon,
      lat,
      allowSpherical: new UIEventSource<boolean>(false),
      blacklist: AllImageProviders.LoadImagesFor(tags),
    },
    state.indexedFeatures
  )

  let images: Store<P4CPicture[]> = imagesProvider.store.map((images) => images.slice(0, 20))
  let allDone = imagesProvider.allDone
</script>

<LoginToggle {state}>
  <div class="interactive border-interactive rounded-2xl p-2">
    <div class="flex justify-between">
      <h4>
        <Tr t={Translations.t.image.nearby.title} />
      </h4>
      <slot name="corner" />
    </div>
    {#if !$allDone}
      <Loading />
    {:else if $images.length === 0}
      <Tr t={Translations.t.image.nearby.noNearbyImages} cls="alert" />
    {:else}
      <div class="flex w-full space-x-1 overflow-x-auto" style="scroll-snap-type: x proximity">
        {#each $images as image (image.pictureUrl)}
          <span class="w-fit shrink-0" style="scroll-snap-align: start">
            <LinkableImage {tags} {image} {state} {feature} {layer} {linkable} />
          </span>
        {/each}
      </div>
    {/if}
  </div>
</LoginToggle>
