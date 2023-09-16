<script lang="ts">
  import { Store } from "../../Logic/UIEventSource";
  import type { OsmTags } from "../../Models/OsmFeature";
  import type { SpecialVisualizationState } from "../SpecialVisualization";
  import type { Feature } from "geojson";
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
  import Translations from "../i18n/Translations";
  import Tr from "../Base/Tr.svelte";
  import NearbyImages from "./NearbyImages.svelte";
  import Svg from "../../Svg";
  import ToSvelte from "../Base/ToSvelte.svelte";

  export let tags: Store<OsmTags>;
  export let state: SpecialVisualizationState;
  export let lon: number;
  export let lat: number;
  export let feature: Feature;

  export let linkable: boolean = true;
  export let layer: LayerConfig;
  const t = Translations.t.image.nearby;

  let expanded = false;
</script>

{#if expanded}
  <NearbyImages {tags} {state} {lon} {lat} {feature} {linkable}/>
{:else}
  <button class="w-full flex items-center" on:click={() => { expanded = true; }}>
    <ToSvelte construct={ Svg.camera_plus_svg().SetClass("block w-8 h-8 p-1 mr-2 ")}/>
    <Tr t={t.seeNearby}/></button>
{/if}
