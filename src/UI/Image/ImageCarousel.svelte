<script lang="ts">
  import { Store } from "../../Logic/UIEventSource.js"
  import type { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import DeletableImage from "./DeletableImage.svelte"

  export let images: Store<ProvidedImage[]>
  export let state: SpecialVisualizationState
  export let tags: Store<Record<string, string>>

</script>


<div class="flex w-full space-x-2 overflow-x-auto" style="scroll-snap-type: x proximity">
  {#each $images as image (image.url)}
    <DeletableImage {image} {state} {tags}/>
  {/each}
</div>


