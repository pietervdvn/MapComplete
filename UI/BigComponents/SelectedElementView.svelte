<script lang="ts">
  import type { Feature } from "geojson";
  import { Store, UIEventSource } from "../../Logic/UIEventSource";
  import TagRenderingAnswer from "../Popup/TagRenderingAnswer";
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
  import ToSvelte from "../Base/ToSvelte.svelte";
  import { VariableUiElement } from "../Base/VariableUIElement.js";
  import type { SpecialVisualizationState } from "../SpecialVisualization";
  import { onDestroy } from "svelte";

  export let selectedElement: UIEventSource<Feature>;
  export let layer: UIEventSource<LayerConfig>;
  export let tags: Store<UIEventSource<Record<string, string>>>;
  let _tags: UIEventSource<Record<string, string>>;
  onDestroy(tags.subscribe(tags => {
    _tags = tags;
    return false
  }));

  export let specialVisState: SpecialVisualizationState;

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
  <div on:click={() =>selectedElement.setData(undefined)}>close</div>
  <div class="flex flex-col sm:flex-row flex-grow justify-between">
    <!-- Title element-->
    <ToSvelte
      construct={() => new VariableUiElement(tags.mapD(tags =>   new TagRenderingAnswer(tags, layer.data.title, specialVisState), [layer]))}></ToSvelte>

    <div class="flex flex-row flex-wrap pt-0.5 sm:pt-1 items-center mr-2">

      {#each $layer.titleIcons as titleIconConfig (titleIconConfig.id)}
        <div class="w-8 h-8">
          <ToSvelte
            construct={() => new VariableUiElement(tags.mapD(tags =>   new TagRenderingAnswer(tags, titleIconConfig, specialVisState)))}></ToSvelte>
        </div>

      {/each}
    </div>


  </div>

  <ul>

    {#each Object.keys($_tags) as key}
      <li><b>{key}</b>=<b>{$_tags[key]}</b></li>
    {/each}
  </ul>
</div>
