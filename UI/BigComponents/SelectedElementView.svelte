<script lang="ts">
  import type { Feature } from "geojson";
  import { UIEventSource } from "../../Logic/UIEventSource";
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
  import type { SpecialVisualizationState } from "../SpecialVisualization";
  import TagRenderingAnswer from "../Popup/TagRendering/TagRenderingAnswer.svelte";
  import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte";
  import { onDestroy } from "svelte";

  export let selectedElement: Feature;
  export let layer: LayerConfig;
  export let tags: UIEventSource<Record<string, string>>;

  let _tags: Record<string, string>;
  onDestroy(tags.addCallbackAndRun(tags => {
    _tags = tags;
  }));
  export let state: SpecialVisualizationState;
</script>

<div>
  <div class="flex flex-col sm:flex-row flex-grow justify-between">
    <!-- Title element-->
    <h3>
      <TagRenderingAnswer config={layer.title} {selectedElement} {state} {tags} {layer}></TagRenderingAnswer>
    </h3>

    <div class="flex flex-row flex-wrap pt-0.5 sm:pt-1 items-center mr-2">
      {#each layer.titleIcons as titleIconConfig (titleIconConfig.id)}
        <div class="w-8 h-8">
          <TagRenderingAnswer config={titleIconConfig} {tags} {selectedElement} {state} {layer}></TagRenderingAnswer>
        </div>
      {/each}
    </div>


  </div>

  <div class="flex flex-col">
    {#each layer.tagRenderings as config (config.id)}
      {#if config.condition === undefined || config.condition.matchesProperties(_tags)}
        {#if config.IsKnown(_tags)}
          <TagRenderingEditable {tags} {config} {state} {selectedElement} {layer}></TagRenderingEditable>
        {/if}
      {/if}
    {/each}
  </div>

</div>
