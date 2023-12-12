<script lang="ts">
  import { Store } from "../../Logic/UIEventSource";
  import type { OsmTags } from "../../Models/OsmFeature";
  import type { SpecialVisualizationState } from "../SpecialVisualization";
  import type { Feature } from "geojson";
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
  import Translations from "../i18n/Translations";
  import Tr from "../Base/Tr.svelte";
  import NearbyImages from "./NearbyImages.svelte";
  import { XCircleIcon } from "@babeard/svelte-heroicons/solid";
  import Camera_plus from "../../assets/svg/Camera_plus.svelte";
  import LoginToggle from "../Base/LoginToggle.svelte";

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
<LoginToggle {state}>

  {#if expanded}
    <NearbyImages {tags} {state} {lon} {lat} {feature} {linkable}>
      <button slot="corner"
              class="h-6 w-6 cursor-pointer no-image-background p-0 border-none"
              on:click={() => {
        expanded = false
        }}>
        <XCircleIcon />
      </button>
    </NearbyImages>
  {:else}
    <button
      class="flex w-full items-center"
      on:click={() => {
      expanded = true
    }}
      aria-expanded={expanded}
    >
      <Camera_plus class="mr-2 block h-8 w-8 p-1" />
      <Tr t={t.seeNearby} />
    </button>
  {/if}
</LoginToggle>
