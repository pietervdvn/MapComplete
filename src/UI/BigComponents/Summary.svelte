<script lang="ts">
  import type { Feature } from "geojson"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import SelectedElementTitle from "./SelectedElementTitle.svelte"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import TagRenderingAnswer from "../Popup/TagRendering/TagRenderingAnswer.svelte"

  export let state: SpecialVisualizationState
  export let feature: Feature
  let id = feature.properties.id
  let tags = state.featureProperties.getStore(id)
  let layer: LayerConfig = state.layout.getMatchingLayer(tags.data)
</script>

<TagRenderingAnswer config={layer.title} selectedElement={feature} {state} {tags} {layer} />
