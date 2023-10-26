<script lang="ts">
  import Marker from "../Map/Marker.svelte";
  import NextButton from "../Base/NextButton.svelte";
  import { createEventDispatcher } from "svelte";
  import { AllSharedLayers } from "../../Customizations/AllSharedLayers";
  import { AllKnownLayouts, AllKnownLayoutsLazy } from "../../Customizations/AllKnownLayouts";

  export let layerIds: { id: string }[];
  export let category: "layers" | "themes" = "layers";
  const dispatch = createEventDispatcher<{ layerSelected: string }>();

  function fetchIconDescription(layerId): any {
    if(category === "themes"){
      return AllKnownLayouts.allKnownLayouts.get(layerId).icon
    }
    return AllSharedLayers.getSharedLayersConfigs().get(layerId)?._layerIcon;
  }

</script>

{#if layerIds.length > 0}
  <slot name="title" />
  <div class="flex flex-wrap">
    {#each Array.from(layerIds) as layer}
      <NextButton clss="small" on:click={() => dispatch("layerSelected", layer.id)}>
        <div class="w-4 h-4 mr-1">
          <Marker icons={fetchIconDescription(layer.id)} />
        </div>
        {layer.id}
      </NextButton>
    {/each}
  </div>
{/if}
