<script lang="ts">
  import type { ConfigMeta } from "./configMeta";
  import EditLayerState from "./EditLayerState";
  import * as questions from "../../assets/generated/layers/questions.json";
  import { ImmutableStore, Store } from "../../Logic/UIEventSource";
  import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte";
  import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";
  import nmd from "nano-markdown";
  import type {
    QuestionableTagRenderingConfigJson
  } from "../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson.js";
  import type { TagRenderingConfigJson } from "../../Models/ThemeConfig/Json/TagRenderingConfigJson";
  import FromHtml from "../Base/FromHtml.svelte";
  import { Utils } from "../../Utils";

  export let state: EditLayerState;
  export let path: ReadonlyArray<string | number>;
  export let schema: ConfigMeta;
  let value = state.getStoreFor(path);

  let perId: Record<string, TagRenderingConfigJson[]> = {};
  for (const tagRendering of questions.tagRenderings) {
    if (tagRendering.labels) {
      for (const label of tagRendering.labels) {
        perId[label] = (perId[label] ?? []).concat(tagRendering);
      }
    }
    perId[tagRendering.id] = [tagRendering];
  }

  let configJson: Store<QuestionableTagRenderingConfigJson[]> = value.map(x => {
    if (typeof x === "string") {
      return perId[x];
    } else {
      return [x];
    }
  });
  let configs: Store<TagRenderingConfig[]> =configJson.mapD(configs =>  Utils.NoNull( configs.map(config => {
    try{
      return new TagRenderingConfig(config);
    }catch (e) {
      return undefined
    }
  })));
  let id: Store<string> = value.mapD(c => {
    if (c?.id) {
      return c.id;
    }
    if (typeof c === "string") {
      return c;
    }
    return undefined;
  });

  let tags = state.testTags;

  let messages = state.messagesFor(path);

  let description = schema.description
  if(description){
    try{
      description = nmd(description)
    }catch (e) {
      console.error("Could not convert description to markdown", {description})
    }
  }
</script>

<div class="flex">

  <div class="flex flex-col interactive border-interactive m-4 w-full">

    {#if $id}
      TagRendering {$id}
    {/if}
    <button on:click={() => state.highlightedItem.setData({path, schema})}>
      {#if schema.hints.question}
        {schema.hints.question}
      {/if}
    </button>
    {#if description}
      <FromHtml src={description} />
    {/if}
    {#each $messages as message}
      <div class="alert">
        {message.message}
      </div>
    {/each}

    <slot class="self-end my-4"></slot>


  </div>

  <div class="flex flex-col w-full m-4">
    {#each $configs as config}
      <TagRenderingEditable
        selectedElement={state.exampleFeature}
        config={config} editingEnabled={new ImmutableStore(true)} showQuestionIfUnknown={true}
        {state}
        {tags}></TagRenderingEditable>
    {/each}
  </div>


</div>
