<script lang="ts">
  import { IconConfig } from "../../Models/ThemeConfig/PointRenderingConfig"
  import { Store } from "../../Logic/UIEventSource"
  import Icon from "./Icon.svelte"

  /**
   * Renders a single icon.
   *
   * Icons -placed on top of each other- form a 'Marker' together
   */
  export let icon: IconConfig
  export let tags: Store<Record<string, string>>

  let iconItem = icon.icon?.GetRenderValue($tags)?.Subs($tags)?.txt
  $: iconItem = icon.icon?.GetRenderValue($tags)?.Subs($tags)?.txt
  let color = icon.color?.GetRenderValue($tags)?.txt ?? "#000000"
  $: color = icon.color?.GetRenderValue($tags)?.txt ?? "#000000"
</script>

<Icon icon={iconItem} {color} />
