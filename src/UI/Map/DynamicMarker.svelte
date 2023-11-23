<script lang="ts">
  import PointRenderingConfig, { IconConfig } from "../../Models/ThemeConfig/PointRenderingConfig"
  import { Store } from "../../Logic/UIEventSource"
  import DynamicIcon from "./DynamicIcon.svelte"

  /**
   * Renders a 'marker', which consists of multiple 'icons'
   */
  export let config: PointRenderingConfig
  let icons: IconConfig[] = config.marker
  export let tags: Store<Record<string, string>>
  let rotation = tags.map((tags) => config.rotation.GetRenderValue(tags).Subs(tags).txt)
</script>

{#if config !== undefined}
  <div class="relative h-full w-full" style={`transform: rotate(${$rotation})`}>
    {#each icons as icon}
      <DynamicIcon {icon} {tags} />
    {/each}
  </div>
{/if}
