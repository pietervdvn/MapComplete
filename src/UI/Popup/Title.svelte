<script lang="ts">
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { Feature } from "geojson"
  import SpecialTranslation from "./TagRendering/SpecialTranslation.svelte"

  /**
   * The 'title'-special visualisation
   * Mainly used to embed in other special renderings
   */
  export let state: SpecialVisualizationState
  export let layer: LayerConfig

  export let tags: UIEventSource<Record<string, string>>
  export let feature: Feature

  let theme = state.theme
  let title = tags.mapD((tags) => layer?.title?.GetRenderValue(tags))
</script>

{#if theme === undefined}
  _feature title_ <!-- Probably doc generation -->
{/if}
{#if $title}
  <SpecialTranslation t={$title} {tags} {state} {feature} {layer} />
{/if}
