<script lang="ts">
  import { IconConfig } from "../../Models/ThemeConfig/PointRenderingConfig"
  import { Store } from "../../Logic/UIEventSource"
  import Icon from "./Icon.svelte"
  import { Utils } from "../../Utils"

  /**
   * Renders a single icon.
   *
   * Icons -placed on top of each other- form a 'Marker' together
   */
  export let icon: IconConfig
  export let tags: Store<Record<string, string>>
  /**
   * Only used in case of emoji
   */
  export let emojiHeight: number = 40

  let iconItem = icon.icon?.GetRenderValue($tags)?.Subs($tags)?.txt
  $: iconItem = icon.icon?.GetRenderValue($tags)?.Subs($tags)?.txt
  let color = icon.color?.GetRenderValue($tags)?.txt ?? "#000000"
  $: color = icon.color?.GetRenderValue($tags)?.txt ?? "#000000"


</script>

{#if iconItem?.startsWith("<")}
  {@html iconItem}
{:else}
  <Icon icon={iconItem} {color} {emojiHeight} />
{/if}
