<script lang="ts">
  /**
   * Shows an image with attribution
   */
  import ImageAttribution from "./ImageAttribution.svelte"
  import type { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"
  import { Mapillary } from "../../Logic/ImageProviders/Mapillary"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import { MagnifyingGlassPlusIcon } from "@babeard/svelte-heroicons/outline"

  export let image: Partial<ProvidedImage>
  let fallbackImage: string = undefined
  if (image.provider === Mapillary.singleton) {
    fallbackImage = "./assets/svg/blocked.svg"
  }

  let imgEl: HTMLImageElement
  export let imgClass: string = undefined
  export let previewedImage: UIEventSource<ProvidedImage> = undefined
  export let attributionFormat: "minimal" | "medium" | "large" = "medium"
  let canZoom = previewedImage !== undefined // We check if there is a SOURCE, not if there is data in it!
  let loaded = false
</script>

<div class="relative shrink-0">
  <div class="relative w-fit">
    <img
      bind:this={imgEl}
      on:load={() => (loaded = true)}
      class={imgClass ?? ""}
      class:cursor-zoom-in={previewedImage !== undefined}
      on:click={() => {
        previewedImage?.setData(image)
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
        on:click={() => previewedImage.set(image)}
      >
        <MagnifyingGlassPlusIcon class="h-8 w-8 cursor-zoom-in pl-3 pb-3" color="white" />
      </div>
    {/if}
  </div>
  <div class="absolute bottom-0 left-0">
    <ImageAttribution {image} {attributionFormat} />
  </div>
</div>
