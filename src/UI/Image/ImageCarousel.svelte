<script lang="ts">
  import { Store, UIEventSource } from "../../Logic/UIEventSource.js"
  import type { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"
  import AttributedImage from "../Image/AttributedImage.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import DeleteImage from "./DeleteImage"
  import Popup from "../Base/Popup.svelte"
  import TitledPanel from "../Base/TitledPanel.svelte"
  import AccordionSingle from "../Flowbite/AccordionSingle.svelte"
  import NextButton from "../Base/NextButton.svelte"
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


