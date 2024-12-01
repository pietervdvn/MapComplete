<script lang="ts">
  import AttributedImage from "../Image/AttributedImage.svelte"
  import PanoramaxImageProvider from "../../Logic/ImageProviders/Panoramax"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"

  export let hash: string
  let image: UIEventSource<ProvidedImage> = UIEventSource.FromPromise(PanoramaxImageProvider.singleton.getInfo(hash))
</script>

{#if $image !== undefined}
  <AttributedImage image={$image}></AttributedImage>
{/if}
