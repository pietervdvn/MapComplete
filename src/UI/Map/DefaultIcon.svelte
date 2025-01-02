<script lang="ts">
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import DynamicIcon from "./DynamicIcon.svelte"
  import DynamicMarker from "./DynamicMarker.svelte"
  import Marker from "./Marker.svelte"
  import { ImmutableStore } from "../../Logic/UIEventSource"

  /**
   * The 'DefaultIcon' is the icon that a layer shows by default
   * Used e.g. in the filterview
   */
  export let layer: LayerConfig
  export let properties: Readonly<Record<string, string>> = layer.baseTags
  export let clss = ""
  let tags = new ImmutableStore(properties)
  let mapRenderings = layer.mapRendering?.filter((r) => r.location.has("point"))
</script>

{#if mapRenderings?.length > 0}
  <div class={"relative block h-full w-full " + clss}>
    {#each mapRenderings as mr}
      <DynamicMarker marker={mr.marker} rotation={mr.rotation} {tags} />
    {/each}
  </div>
{/if}
