<script lang="ts">
  import { Store, UIEventSource } from "../../Logic/UIEventSource.js"
  import type { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import DeletableImage from "./DeletableImage.svelte"
  import Loading from "../Base/Loading.svelte"
  import LoadingPlaceholder from "../Base/LoadingPlaceholder.svelte"

  export let images: Store<ProvidedImage[]>
  export let state: SpecialVisualizationState
  export let tags: UIEventSource<Record<string, string>>

  export let estimated: Store<number>
</script>

{#if $estimated > 0 && $images.length < 1}
  <LoadingPlaceholder />
{:else}
  <div class="w-full overflow-x-auto" style="scroll-snap-type: x proximity">
    <div class="flex space-x-2">
      {#each $images as image (image.url)}
        <DeletableImage {image} {state} {tags} />
      {/each}
    </div>
  </div>
{/if}
