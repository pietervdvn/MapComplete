<script lang="ts">
  import type { Feature } from "geojson"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import TagRenderingAnswer from "../Popup/TagRendering/TagRenderingAnswer.svelte"

  export let state: SpecialVisualizationState
  export let feature: Feature
  export let i: number = undefined
  let id = feature.properties.id
  let tags = state.featureProperties.getStore(id)
  let layer: LayerConfig = state.layout.getMatchingLayer(tags.data)

  function select() {
    state.selectedElement.setData(undefined)
    state.selectedLayer.setData(layer)
    state.selectedElement.setData(feature)
  }
</script>

<button class="cursor-pointer small" on:click={() => select()}>
  {#if i !== undefined}
    <span class="font-bold">{i + 1}.</span>
  {/if}
  <TagRenderingAnswer config={layer.title} {layer} selectedElement={feature} {state} {tags} />
</button>
