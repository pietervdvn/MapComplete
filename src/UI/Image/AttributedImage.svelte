<script lang="ts">
  /**
   * Shows an image with attribution
   */
  import ImageAttribution from "./ImageAttribution.svelte"
  import type { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"
  import { Mapillary } from "../../Logic/ImageProviders/Mapillary"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import { MagnifyingGlassPlusIcon } from "@babeard/svelte-heroicons/outline"
  import { CloseButton, Modal } from "flowbite-svelte"
  import ImageOperations from "./ImageOperations.svelte"
  import Popup from "../Base/Popup.svelte"
  import { onDestroy } from "svelte"

  export let image: Partial<ProvidedImage>
  let fallbackImage: string = undefined
  if (image.provider === Mapillary.singleton) {
    fallbackImage = "./assets/svg/blocked.svg"
  }

  let imgEl: HTMLImageElement
  export let imgClass: string = undefined
  export let attributionFormat: "minimal" | "medium" | "large" = "medium"
  export let previewedImage: UIEventSource<ProvidedImage>
  export let canZoom = previewedImage !== undefined
  let loaded = false
  let showBigPreview =  new UIEventSource(false)
  onDestroy(showBigPreview.addCallbackAndRun(shown=>{
    if(!shown){
      previewedImage.set(false)
    }
  }))
  onDestroy(previewedImage.addCallbackAndRun(previewedImage => {
    showBigPreview.set(previewedImage?.id === image.id)
  }))
</script>

<Popup shown={showBigPreview} bodyPadding="p-0">
  <div slot="close" />
  <div style="height: 80vh">
    <ImageOperations {image}>
      <slot name="preview-action" />
    </ImageOperations>
  </div>
  <div class="absolute top-4 right-4">
    <CloseButton class="normal-background"
                 on:click={() => {console.log("Closing");previewedImage.set(undefined)}}></CloseButton>
  </div>
</Popup>
<div class="relative shrink-0">
  <div class="relative w-fit">
    <img
      bind:this={imgEl}
      on:load={() => loaded = true}
      class={imgClass ?? ""}
      class:cursor-zoom-in={canZoom}
      on:click={() => {
        previewedImage.set(image)
    }}
      on:error={() => {
      if (fallbackImage) {
        imgEl.src = fallbackImage
      }
    }}
      src={image.url}
    />

    {#if canZoom && loaded}
      <div class="absolute right-0 top-0 bg-black-transparent rounded-bl-full"
           on:click={() => previewedImage.set(image)}>
        <MagnifyingGlassPlusIcon class="w-8 h-8 pl-3 pb-3 cursor-zoom-in" color="white" />
      </div>
    {/if}

  </div>
  <div class="absolute bottom-0 left-0">
    <ImageAttribution {image} {attributionFormat} />
  </div>
</div>
