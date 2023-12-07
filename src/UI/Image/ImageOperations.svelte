<script lang="ts">/**
 * The 'imageOperations' previews an image and offers some extra tools (e.g. download)
 */

import type { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"
import ImageAttribution from "./ImageAttribution.svelte"
import ImagePreview from "./ImagePreview.svelte"
import { DownloadIcon } from "@rgossiaux/svelte-heroicons/solid"
import { Utils } from "../../Utils"
import { twMerge } from "tailwind-merge";

export let image: ProvidedImage
export let clss: string = undefined
async function download() {
    const response = await fetch(image.url_hd ?? image.url )
    const blob = await response.blob()
    Utils.offerContentsAsDownloadableFile(blob, new URL(image.url).pathname.split("/").at(-1), {
        mimetype: "image/jpg",
    })
}

</script>

<div class={twMerge("w-full h-full relative", clss)}>
  <div class="absolute top-0 left-0 w-full h-full overflow-hidden panzoom-container focusable">
    <ImagePreview image={image} />
  </div>
  <div class="absolute bottom-0 left-0 w-full pointer-events-none flex flex-wrap justify-between items-end">
    <div class="pointer-events-auto w-fit opacity-50 hover:opacity-100 transition-colors duration-200 m-1">
      <ImageAttribution image={image} />
    </div>

    <button
      class="no-image-background flex items-center pointer-events-auto bg-black opacity-50 hover:opacity-100 text-white transition-colors duration-200"
      on:click={() => download()}>
      <DownloadIcon class="w-6 h-6 px-2 opacity-100" />
      Download
    </button>
  </div>


</div>
