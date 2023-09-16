<script lang="ts">/**
 * Show nearby images which can be clicked
 */
import type { OsmTags } from "../../Models/OsmFeature";
import { Store, UIEventSource } from "../../Logic/UIEventSource";
import type { SpecialVisualizationState } from "../SpecialVisualization";
import type { P4CPicture } from "../../Logic/Web/NearbyImagesSearch";
import NearbyImagesSearch from "../../Logic/Web/NearbyImagesSearch";
import LinkableImage from "./LinkableImage.svelte";
import type { Feature } from "geojson";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import Loading from "../Base/Loading.svelte";
import AllImageProviders from "../../Logic/ImageProviders/AllImageProviders";

export let tags: Store<OsmTags>;
export let state: SpecialVisualizationState;
export let lon: number;
export let lat: number;
export let feature: Feature;

export let linkable: boolean = true;
export let layer: LayerConfig;

let imagesProvider = new NearbyImagesSearch({
  lon, lat, allowSpherical: new UIEventSource<boolean>(false),
  blacklist: AllImageProviders.LoadImagesFor(tags)
}, state.indexedFeatures);

let images: Store<P4CPicture[]> = imagesProvider.store.map(images => images.slice(0, 20));

</script>

{#if $images.length === 0}
  <Loading />
{:else}
  <div class="py-2 interactive overflow-x-auto w-full flex space-x-1">
    {#each $images as image (image.pictureUrl)}
      <LinkableImage {tags} {image} {state} {lon} {lat} {feature} {layer} {linkable} />
    {/each}
  </div>
{/if}
