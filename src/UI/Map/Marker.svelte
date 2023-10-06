<script lang="ts">

  import PointRenderingConfig, { IconConfig } from "../../Models/ThemeConfig/PointRenderingConfig";
  import Icon from "./Icon.svelte";
  import { Store } from "../../Logic/UIEventSource";

  /**
   * Renders a 'marker', which consists of multiple 'icons'
   */
  export let config : PointRenderingConfig
  let icons: IconConfig[] = config.marker;
  export let tags: Store<Record<string, string>>;
  
</script>

<div class="relative w-full h-full">
  {#each icons as icon}
    <Icon {icon} {tags} />
  {/each}
</div>
