<script lang="ts">/**
 * Wrapper around 'tagRenderingEditable' but might add mappings dynamically
 */
import TagRenderingConfig, { TagRenderingConfigUtils } from "../../../Models/ThemeConfig/TagRenderingConfig"
import { UIEventSource } from "../../../Logic/UIEventSource"
import type { Feature } from "geojson"
import type { SpecialVisualizationState } from "../../SpecialVisualization"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
import TagRenderingQuestion from "./TagRenderingQuestion.svelte"
import type { UploadableTag } from "../../../Logic/Tags/TagUtils"

export let config: TagRenderingConfig
export let tags: UIEventSource<Record<string, string>>

export let selectedElement: Feature
export let state: SpecialVisualizationState
export let layer: LayerConfig | undefined
export let selectedTags: UploadableTag = undefined
export let extraTags: UIEventSource<Record<string, string>> = new UIEventSource({})

export let allowDeleteOfFreeform: boolean = false


let dynamicConfig = TagRenderingConfigUtils.withNameSuggestionIndex(config, tags, selectedElement)
</script>

<TagRenderingQuestion
  {tags}
  config={$dynamicConfig}
  {state}
  {selectedElement}
  {layer}
  {selectedTags}
  {allowDeleteOfFreeform}
  {extraTags}
/>
