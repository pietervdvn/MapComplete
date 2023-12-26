<script lang="ts">
  /**
   * The image preview allows to drag and zoom in to the image
   */
  import panzoom from "panzoom"
  import type { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"
  import { UIEventSource } from "../../Logic/UIEventSource"

  export let image: ProvidedImage
  let panzoomInstance = undefined
  let panzoomEl: HTMLElement
  export let isLoaded: UIEventSource<boolean> = undefined

  $: {
    if (panzoomEl) {
      panzoomInstance = panzoom(panzoomEl, {
        bounds: true,
        boundsPadding: 0.49,
        minZoom: 1,
        maxZoom: 25,
        initialZoom: 1.0,
      })
    } else {
      panzoomInstance?.dispose()
    }
  }
</script>

<img bind:this={panzoomEl} class="panzoom-image h-fit w-fit" on:load={() => {isLoaded?.setData(true)}}
     src={image.url_hd ?? image.url} />
