<script lang="ts">
  import { IconConfig } from "../../Models/ThemeConfig/PointRenderingConfig"
  import { ImmutableStore, Store } from "../../Logic/UIEventSource"
  import DynamicIcon from "./DynamicIcon.svelte"
  import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"

  /**
   * Renders a 'marker', which consists of multiple 'icons'
   */
  export let marker: IconConfig[] = config?.marker
  export let tags: Store<Record<string, string>>
  export let rotation: TagRenderingConfig
  let _rotation = rotation
    ? tags.map((tags) => rotation.GetRenderValue(tags).Subs(tags).txt)
    : new ImmutableStore(0)
</script>

{#if marker && marker}
  <div class="relative h-full w-full" style={`transform: rotate(${$_rotation})`}>
    {#each marker as icon}
      <DynamicIcon {icon} {tags} />
    {/each}
  </div>
{/if}
