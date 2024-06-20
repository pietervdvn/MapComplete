<script lang="ts">
  /**
   * Displays a 'nothing is yet known' if all questions are unanswered
   */
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"

  export let state: SpecialVisualizationState
  export let tags: UIEventSource<Record<string, string>>
  export let layer: LayerConfig
  export let text: string
  export let cssClasses: string = ""
  let knowableRenderings = layer.tagRenderings.filter((tr) => tr.question !== undefined)
  let hasKnownQuestion = tags.mapD((t) => knowableRenderings.some((tr) => tr.IsKnown(t)))
</script>

{#if !$hasKnownQuestion}
  <span class={cssClasses}>
    {text}
  </span>
{/if}
