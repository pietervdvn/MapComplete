<script lang="ts">
  import TagRenderingConfig from "../../../Models/ThemeConfig/TagRenderingConfig";
  import { UIEventSource } from "../../../Logic/UIEventSource";
  import type { Feature } from "geojson";
  import type { SpecialVisualizationState } from "../../SpecialVisualization";
  import TagRenderingAnswer from "./TagRenderingAnswer.svelte";
  import { PencilAltIcon } from "@rgossiaux/svelte-heroicons/solid";
  import TagRenderingQuestion from "./TagRenderingQuestion.svelte";
  import { onDestroy } from "svelte";
  import Tr from "../../Base/Tr.svelte";
  import Translations from "../../i18n/Translations.js";
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";

  export let config: TagRenderingConfig;
  export let tags: UIEventSource<Record<string, string>>;
  export let selectedElement: Feature;
  export let state: SpecialVisualizationState;
  export let layer: LayerConfig;

  export let highlightedRendering: UIEventSource<string> = undefined;
  export let showQuestionIfUnknown: boolean = false;
  let editMode = false;
  onDestroy(tags.addCallbackAndRunD(tags => {
    editMode = showQuestionIfUnknown && !config.IsKnown(tags);

  }));

  let htmlElem: HTMLElement;
  const _htmlElement = new UIEventSource<HTMLElement>(undefined);
  $: _htmlElement.setData(htmlElem);

  function setHighlighting() {
    if (highlightedRendering === undefined) {
      return;
    }
    if (htmlElem === undefined) {
      return;
    }
    const highlighted = highlightedRendering.data;
    if (config.id === highlighted) {
      htmlElem.classList.add("glowing-shadow");
    } else {
      htmlElem.classList.remove("glowing-shadow");
    }
  }

  if (highlightedRendering) {
    onDestroy(highlightedRendering?.addCallbackAndRun(() => setHighlighting()))
    onDestroy(_htmlElement.addCallbackAndRun(() => setHighlighting()))
  }


</script>

<div bind:this={htmlElem}>
  {#if config.question}
    {#if editMode}
      <TagRenderingQuestion {config} {tags} {selectedElement} {state} {layer}>
        <button slot="cancel" on:click={() => {editMode = false}}>
          <Tr t={Translations.t.general.cancel} />
        </button>
      </TagRenderingQuestion>
    {:else}
      <div class="flex justify-between">
        <TagRenderingAnswer {config} {tags} {selectedElement} {state} {layer} />
        <button on:click={() => {editMode = true}} class="shrink-0 w-6 h-6 rounded-full subtle-background p-1">
          <PencilAltIcon></PencilAltIcon>
        </button>
      </div>
    {/if}
  {:else }
    <TagRenderingAnswer {config} {tags} {selectedElement} {state} {layer} />
  {/if}
</div>
