<script lang="ts">
  import type { Feature } from "geojson";
  import { UIEventSource } from "../../Logic/UIEventSource";
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
  import type { SpecialVisualizationState } from "../SpecialVisualization";
  import TagRenderingAnswer from "../Popup/TagRendering/TagRenderingAnswer.svelte";
  import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte";
  import { onDestroy } from "svelte";
  import Translations from "../i18n/Translations";
  import Tr from "../Base/Tr.svelte";

  export let state: SpecialVisualizationState;
  export let layer: LayerConfig;
  export let selectedElement: Feature;
  export let tags: UIEventSource<Record<string, string>>;
  export let highlightedRendering: UIEventSource<string> = undefined;


  let _tags: Record<string, string>;
  onDestroy(tags.addCallbackAndRun(tags => {
    _tags = tags;
  }));

  let _metatags: Record<string, string>;
  onDestroy(state.userRelatedState.preferencesAsTags.addCallbackAndRun(tags => {
    _metatags = tags;
  }));
</script>


{#if _tags._deleted === "yes"}
  <Tr t={ Translations.t.delete.isDeleted} />
{:else}
  <div>
    <div class="flex flex-col sm:flex-row flex-grow justify-between">
      <!-- Title element-->
      <h3>
        <TagRenderingAnswer config={layer.title} {selectedElement} {state} {tags} {layer}></TagRenderingAnswer>
      </h3>

      <div class="flex flex-row flex-wrap pt-0.5 sm:pt-1 items-center mr-2">
        {#each layer.titleIcons as titleIconConfig}
          {#if ( titleIconConfig.condition?.matchesProperties(_tags) ?? true) && (titleIconConfig.metacondition?.matchesProperties(_tags) ?? true) && titleIconConfig.IsKnown(_tags)}
            <div class="w-8 h-8">
              <TagRenderingAnswer config={titleIconConfig} {tags} {selectedElement} {state}
                                  {layer}></TagRenderingAnswer>
            </div>
          {/if}
        {/each}
      </div>


    </div>

    <div class="flex flex-col">
      {#each layer.tagRenderings as config (config.id)}
        {#if (config.condition === undefined || config.condition.matchesProperties(_tags)) && (config.metacondition === undefined || config.metacondition.matchesProperties({ ..._tags, ..._metatags }))}
          {#if config.IsKnown(_tags)}
            <TagRenderingEditable {tags} {config} {state} {selectedElement} {layer}
                                  {highlightedRendering}></TagRenderingEditable>
          {/if}
        {/if}
      {/each}
    </div>

  </div>
{/if}
