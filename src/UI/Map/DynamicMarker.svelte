<script lang="ts">
  import { IconConfig } from "../../Models/ThemeConfig/PointRenderingConfig"
  import { ImmutableStore, Store } from "../../Logic/UIEventSource"
  import DynamicIcon from "./DynamicIcon.svelte"
  import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"
  import { Orientation } from "../../Sensors/Orientation"

  /**
   * Renders a 'marker', which consists of multiple 'icons'
   */
  export let marker: IconConfig[]
  export let tags: Store<Record<string, string>>
  export let rotation: TagRenderingConfig = undefined

  /**
   * Only used in case of emoji
   */
  export let emojiHeight: number = undefined
  let _rotation: Store<string> = rotation
    ? tags.map((tags) => rotation.GetRenderValue(tags).Subs(tags).txt)
    : new ImmutableStore("0deg")
  if (rotation?.render?.txt === "{alpha}deg") {
    _rotation = Orientation.singleton.alpha.map((alpha) => (alpha ? alpha + "deg" : "0deg  "))
  }
</script>

{#if marker}
  <div class="relative h-full w-full" style={`transform: rotate(${$_rotation})`}>
    {#each marker as icon}
      <div class="absolute left-0 top-0 h-full w-full">
        <DynamicIcon {icon} {tags} {emojiHeight} />
      </div>
    {/each}
  </div>
{/if}
