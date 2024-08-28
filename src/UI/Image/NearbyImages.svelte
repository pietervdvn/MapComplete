<script lang="ts">
  /**
   * Show nearby images which can be clicked
   */
  import type { OsmTags } from "../../Models/OsmFeature"
  import { ImmutableStore, Store, UIEventSource } from "../../Logic/UIEventSource"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import type { P4CPicture } from "../../Logic/Web/NearbyImagesSearch"
  import LinkableImage from "./LinkableImage.svelte"
  import type { Feature } from "geojson"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import Loading from "../Base/Loading.svelte"
  import AllImageProviders from "../../Logic/ImageProviders/AllImageProviders"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import MapillaryLink from "../BigComponents/MapillaryLink.svelte"

  export let tags: UIEventSource<OsmTags>
  export let state: SpecialVisualizationState
  export let lon: number
  export let lat: number
  export let feature: Feature

  export let linkable: boolean = true
  export let layer: LayerConfig

  let imagesProvider = state.nearbyImageSearcher

  let loadedImages = AllImageProviders.LoadImagesFor(tags).mapD(
    (loaded) => new Set(loaded.map((img) => img.url))
  )
  let imageState = imagesProvider.getImagesAround(lon, lat)
  let result: Store<P4CPicture[]> = imageState.images.mapD(
    (pics: P4CPicture[]) =>
      pics
        .filter(
          (p: P4CPicture) =>
            !loadedImages.data.has(p.pictureUrl) && // We don't show any image which is already linked
            !p.details.isSpherical
        )
        .slice(0, 25),
    [loadedImages]
  )

  let someLoading = imageState.state.mapD((stateRecord) =>
    Object.values(stateRecord).some((v) => v === "loading")
  )
  let errors = imageState.state.mapD((stateRecord) =>
    Object.keys(stateRecord).filter((k) => stateRecord[k] === "error")
  )
</script>

<div class="flex flex-col">
  {#if $result.length === 0}
    {#if $someLoading}
      <div class="m-4 flex justify-center">
        <Loading />
      </div>
    {:else}
      <Tr t={Translations.t.image.nearby.noNearbyImages} cls="alert" />
    {/if}
  {:else}
    <div class="flex w-full space-x-4 overflow-x-auto" style="scroll-snap-type: x proximity">
      {#each $result as image (image.pictureUrl)}
        <span class="w-fit shrink-0" style="scroll-snap-align: start">
          <LinkableImage {tags} {image} {state} {feature} {layer} {linkable} />
        </span>
      {/each}
    </div>
  {/if}
  <div class="my-2 flex justify-between">
    <div>
      {#if $someLoading && $result.length > 0}
        <Loading />
      {/if}
      {#if $errors.length > 0}
        <Tr
          cls="alert font-sm block"
          t={Translations.t.image.nearby.failed.Subs({ service: $errors.join(", ") })}
        />
      {/if}
    </div>
    <MapillaryLink
      large={false}
      mapProperties={{ zoom: new ImmutableStore(16), location: new ImmutableStore({ lon, lat }) }}
    />
  </div>
</div>
