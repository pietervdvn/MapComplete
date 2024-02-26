<script lang="ts">
  /**
   * Shows an image with attribution
   */
  import ImageAttribution from "./ImageAttribution.svelte"
  import type { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"
  import { Mapillary } from "../../Logic/ImageProviders/Mapillary"
  import { UIEventSource } from "../../Logic/UIEventSource"

  export let image: Partial<ProvidedImage>
  let fallbackImage: string = undefined
  if (image.provider === Mapillary.singleton) {
    fallbackImage = "./assets/svg/blocked.svg"
  }

  let imgEl: HTMLImageElement
  export let imgClass: string = undefined
  export let previewedImage: UIEventSource<ProvidedImage> = undefined
</script>

<div class="relative shrink-0">
  <img
    bind:this={imgEl}
    class={imgClass ?? ""}
    class:cursor-pointer={previewedImage !== undefined}
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

  <div class="absolute bottom-0 left-0">
    <ImageAttribution {image} />
  </div>
</div>
