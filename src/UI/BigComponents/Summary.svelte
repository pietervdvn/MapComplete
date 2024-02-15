<script lang="ts">
  import type { Feature } from "geojson"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import TagRenderingAnswer from "../Popup/TagRendering/TagRenderingAnswer.svelte"
  import DirectionIndicator from "../Base/DirectionIndicator.svelte"

  export let state: SpecialVisualizationState
  export let feature: Feature
  export let i: number = undefined
  let id = feature.properties.id
  let tags = state.featureProperties.getStore(id)
  let layer: LayerConfig = state.layout.getMatchingLayer(tags.data)
</script>

<span class="inline-flex gap-x-1">
  <a
    class="small flex w-fit cursor-pointer items-center space-x-0.5"
    href={`#${feature.properties.id}`}
  >
    {#if i !== undefined}
      <span class="font-bold">{i + 1} &nbsp;</span>
    {/if}
    <TagRenderingAnswer
      config={layer.title}
      extraClasses="inline-flex w-fit"
      {layer}
      selectedElement={feature}
      {state}
      {tags}
    />
    <DirectionIndicator {feature} {state} />
  </a>
</span>
