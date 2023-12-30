<script lang="ts">
  /**
   * The 'imageOperations' previews an image and offers some extra tools (e.g. download)
   */

  import type { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"
  import ImageAttribution from "./ImageAttribution.svelte"
  import ImagePreview from "./ImagePreview.svelte"
  import { DownloadIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { Utils } from "../../Utils"
  import { twMerge } from "tailwind-merge"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import Loading from "../Base/Loading.svelte"

  export let image: ProvidedImage
  export let clss: string = undefined

  let isLoaded = new UIEventSource(false)
  async function download() {
    const response = await fetch(image.url_hd ?? image.url)
    const blob = await response.blob()
    Utils.offerContentsAsDownloadableFile(blob, new URL(image.url).pathname.split("/").at(-1), {
      mimetype: "image/jpg",
    })
  }
</script>

<div class={twMerge("relative h-full w-full", clss)}>
  <div class="panzoom-container focusable absolute top-0 left-0 h-full w-full overflow-hidden">
    {#if !$isLoaded}
      <div class="flex h-full w-full items-center justify-center">
        <Loading />
      </div>
    {/if}
    <ImagePreview {image} {isLoaded} />
  </div>
  <div
    class="pointer-events-none absolute bottom-0 left-0 flex w-full flex-wrap items-end justify-between"
  >
    <div
      class="pointer-events-auto m-1 w-fit opacity-50 transition-colors duration-200 hover:opacity-100"
    >
      <ImageAttribution {image} />
    </div>

    <button
      class="no-image-background pointer-events-auto flex items-center bg-black text-white opacity-50 transition-colors duration-200 hover:opacity-100"
      on:click={() => download()}
    >
      <DownloadIcon class="h-6 w-6 px-2 opacity-100" />
      Download
    </button>
  </div>
</div>
