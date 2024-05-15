<script lang="ts">/**
 * Wrapper around 'tagRenderingEditable' but might add mappings dynamically
 */
import TagRenderingConfig, { TagRenderingConfigUtils } from "../../../Models/ThemeConfig/TagRenderingConfig"
import { UIEventSource } from "../../../Logic/UIEventSource"
import type { Feature } from "geojson"
import type { SpecialVisualizationState } from "../../SpecialVisualization"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
import TagRenderingEditable from "./TagRenderingEditable.svelte"

export let config: TagRenderingConfig
export let tags: UIEventSource<Record<string, string>>
export let selectedElement: Feature | undefined
export let state: SpecialVisualizationState
export let layer: LayerConfig = undefined


export let highlightedRendering: UIEventSource<string> = undefined
export let clss = undefined

let dynamicConfig = TagRenderingConfigUtils.withNameSuggestionIndex(config, tags, selectedElement)
</script>

<TagRenderingEditable
  {tags}
  config={$dynamicConfig}
  {state}
  {selectedElement}
  {layer}
  {highlightedRendering}
  {clss}
/>
