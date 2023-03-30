<script lang="ts">
  import type { Feature } from "geojson";
  import { UIEventSource } from "../../Logic/UIEventSource";
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
  import type { SpecialVisualizationState } from "../SpecialVisualization";
  import TagRenderingAnswer from "../Popup/TagRenderingAnswer.svelte";
  import TagRenderingQuestion from "../Popup/TagRenderingQuestion.svelte";

  export let selectedElement: Feature;
  export let layer: LayerConfig;
  export let tags: UIEventSource<Record<string, string>>;

  export let state: SpecialVisualizationState;

  /**
   *        const title = new TagRenderingAnswer(
   *             tags,
   *             layerConfig.title ?? new TagRenderingConfig("POI"),
   *             state
   *         ).SetClass("break-words font-bold sm:p-0.5 md:p-1 sm:p-1.5 md:p-2 text-2xl")
   *         const titleIcons = new Combine(
   *             layerConfig.titleIcons.map((icon) => {
   *                 return new TagRenderingAnswer(
   *                     tags,
   *                     icon,
   *                     state,
   *                     "block h-8 max-h-8 align-baseline box-content sm:p-0.5 titleicon"
   *                 )
   *             })
   *         ).SetClass("flex flex-row flex-wrap pt-0.5 sm:pt-1 items-center mr-2")
   *
   *         return new Combine([
   *             new Combine([title, titleIcons]).SetClass(
   *                 "flex flex-col sm:flex-row flex-grow justify-between"
   *             ),
   *         ])
   */

</script>

<div>
  <div class="flex flex-col sm:flex-row flex-grow justify-between">
    <!-- Title element-->
    <h3>
      <TagRenderingAnswer config={layer.title} {selectedElement} {tags}></TagRenderingAnswer>
    </h3>

    <div class="flex flex-row flex-wrap pt-0.5 sm:pt-1 items-center mr-2">
      {#each layer.titleIcons as titleIconConfig (titleIconConfig.id)}
        <div class="w-8 h-8">
          <TagRenderingAnswer config={titleIconConfig} {tags} {selectedElement}></TagRenderingAnswer>
        </div>
      {/each}
    </div>


  </div>

  <div class="flex flex-col">
    {#each layer.tagRenderings as config (config.id)}
      {#if config.IsKnown($tags)}
        <TagRenderingAnswer {tags} {config} {state}></TagRenderingAnswer>
      {:else}
        <TagRenderingQuestion {config} {tags} {state}></TagRenderingQuestion>
      {/if}
    {/each}
  </div>

</div>
