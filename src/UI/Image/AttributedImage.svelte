<script lang="ts">
  /**
   * Shows an image with attribution
   */
  import ImageAttribution from "./ImageAttribution.svelte"
  import type { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"
  import { Mapillary } from "../../Logic/ImageProviders/Mapillary"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import { MagnifyingGlassPlusIcon } from "@babeard/svelte-heroicons/outline"
  import { CloseButton } from "flowbite-svelte"
  import ImageOperations from "./ImageOperations.svelte"
  import Popup from "../Base/Popup.svelte"
  import { onDestroy } from "svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import type { Feature, Point } from "geojson"
  import Loading from "../Base/Loading.svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import DotMenu from "../Base/DotMenu.svelte"

  export let image: Partial<ProvidedImage>
  let fallbackImage: string = undefined
  if (image.provider === Mapillary.singleton) {
    fallbackImage = "./assets/svg/blocked.svg"
  }

  let imgEl: HTMLImageElement
  export let imgClass: string = undefined
  export let state: SpecialVisualizationState = undefined
  export let attributionFormat: "minimal" | "medium" | "large" = "medium"
  export let previewedImage: UIEventSource<ProvidedImage> = undefined
  export let canZoom = previewedImage !== undefined
  let loaded = false
  let showBigPreview = new UIEventSource(false)
  onDestroy(
    showBigPreview.addCallbackAndRun((shown) => {
      if (!shown) {
        previewedImage?.set(undefined)
      }
    })
  )
  if(previewedImage){
  onDestroy(
    previewedImage.addCallbackAndRun((previewedImage) => {
      showBigPreview.set(previewedImage?.id === image.id)
    })
  )
  }

  function highlight(entered: boolean = true) {
    if (!entered) {
      state?.geocodedImages.set([])
      return
    }
    if (isNaN(image.lon) || isNaN(image.lat)) {
      return
    }
    const f: Feature<Point> = {
      type: "Feature",
      properties: {
        id: image.id,
        rotation: image.rotation,
      },
      geometry: {
        type: "Point",
        coordinates: [image.lon, image.lat],
      },
    }
    console.log(f)
    state?.geocodedImages.set([f])
  }
</script>

<Popup shown={showBigPreview} bodyPadding="p-0" dismissable={true}>
  <div slot="close" />
  <div style="height: 80vh">
    <ImageOperations {image}>
      <slot name="preview-action" />
      <slot name="dot-menu-actions" slot="dot-menu-actions" />
    </ImageOperations>
  </div>
  <div class="absolute top-4 right-4">
    <CloseButton
      class="normal-background"
      on:click={() => {
        console.log("Closing")
        previewedImage?.set(undefined)
      }}
    />
  </div>
</Popup>
{#if image.status !== undefined && image.status !== "ready" && image.status !== "hidden"}
  <div class="flex h-full flex-col justify-center">
    <Loading>
      <Tr t={Translations.t.image.processing} />
    </Loading>
  </div>
{:else}
  <div class="relative shrink-0">
    <div
      class="relative w-fit"
      on:mouseenter={() => highlight()}
      on:mouseleave={() => highlight(false)}
    >
      {#if $$slots["dot-menu-actions"]}
        <DotMenu dotsPosition="top-0 left-0 absolute" hideBackground>
          <slot name="dot-menu-actions" />
        </DotMenu>
      {/if}
      <img
        bind:this={imgEl}
        on:load={() => (loaded = true)}
        class={imgClass ?? ""}
        class:cursor-zoom-in={canZoom}
        on:click={() => {
          previewedImage?.set(image)
        }}
        on:error={() => {
          if (fallbackImage) {
            imgEl.src = fallbackImage
          }
        }}
        src={image.url}
      />

      {#if canZoom && loaded}
        <div
          class="bg-black-transparent absolute right-0 top-0 rounded-bl-full"
          on:click={() => previewedImage?.set(image)}
        >
          <MagnifyingGlassPlusIcon class="h-8 w-8 cursor-zoom-in pl-3 pb-3" color="white" />
        </div>
      {/if}
    </div>
    <div class="absolute bottom-0 left-0">
      <ImageAttribution {image} {attributionFormat} />
    </div>
  </div>
{/if}
