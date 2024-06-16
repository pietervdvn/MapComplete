<script lang="ts">
  import TagRenderingConfig, {
    TagRenderingConfigUtils,
  } from "../../../Models/ThemeConfig/TagRenderingConfig"
  import { Store, UIEventSource } from "../../../Logic/UIEventSource"
  import type { Feature } from "geojson"
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import TagRenderingEditable from "./TagRenderingEditable.svelte"

  export let config: TagRenderingConfig
  export let tags: UIEventSource<Record<string, string>>
  export let selectedElement: Feature | undefined
  export let state: SpecialVisualizationState
  export let layer: LayerConfig = undefined

  export let editingEnabled: Store<boolean> | undefined = state?.featureSwitchUserbadge

  export let highlightedRendering: UIEventSource<string> = undefined
  export let clss = undefined
  export let editMode = !config.IsKnown(tags.data)

  let dynamicConfig = TagRenderingConfigUtils.withNameSuggestionIndex(config, tags, selectedElement)
</script>

<TagRenderingEditable
  config={$dynamicConfig}
  {editMode}
  {clss}
  {highlightedRendering}
  {editingEnabled}
  {layer}
  {state}
  {selectedElement}
  {tags}
/>
