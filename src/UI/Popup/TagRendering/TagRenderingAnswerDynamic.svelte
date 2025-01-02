<script lang="ts">
  import TagRenderingConfig, {
    TagRenderingConfigUtils,
  } from "../../../Models/ThemeConfig/TagRenderingConfig"
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import type { Feature } from "geojson"
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import TagRenderingAnswer from "./TagRenderingAnswer.svelte"
  import Loading from "../../Base/Loading.svelte"

  export let tags: UIEventSource<Record<string, string> | undefined>

  export let state: SpecialVisualizationState
  export let selectedElement: Feature
  export let layer: LayerConfig
  export let config: TagRenderingConfig
  export let extraClasses: string | undefined = undefined

  export let id: string = undefined
  let dynamicConfig = TagRenderingConfigUtils.withNameSuggestionIndex(config, tags, selectedElement)
</script>

{#if $dynamicConfig === undefined}
  <Loading />
{:else}
  <TagRenderingAnswer
    {selectedElement}
    {layer}
    config={$dynamicConfig}
    {extraClasses}
    {id}
    {tags}
    {state}
  />
{/if}
