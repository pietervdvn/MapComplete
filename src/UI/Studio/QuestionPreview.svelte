<script lang="ts">
  import type { ConfigMeta } from "./configMeta"
  import EditLayerState from "./EditLayerState"
  import * as questions from "../../assets/generated/layers/questions.json"
  import { ImmutableStore, Store } from "../../Logic/UIEventSource"
  import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte"
  import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"
  import type { QuestionableTagRenderingConfigJson } from "../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson.js"
  import type { TagRenderingConfigJson } from "../../Models/ThemeConfig/Json/TagRenderingConfigJson"
  import FromHtml from "../Base/FromHtml.svelte"
  import ShowConversionMessage from "./ShowConversionMessage.svelte"
  import NextButton from "../Base/NextButton.svelte"
  import Markdown from "../Base/Markdown.svelte"

  export let state: EditLayerState
  export let path: ReadonlyArray<string | number>
  export let schema: ConfigMeta
  let value = state.getStoreFor(path)

  let perId: Record<string, TagRenderingConfigJson[]> = {}
  for (let tagRendering of questions.tagRenderings) {
    if (tagRendering.labels) {
      for (let label of tagRendering.labels) {
        perId[label] = (perId[label] ?? []).concat(tagRendering)
      }
    }
    perId[tagRendering.id] = [tagRendering]
  }

  let configJson: Store<QuestionableTagRenderingConfigJson[]> = value.map((x) => {
    if (typeof x === "string") {
      return perId[x]
    } else {
      return [x]
    }
  })
  let configs: Store<TagRenderingConfig[]> = configJson.map((configs) => {
    if (!configs) {
      return [{ error: "No configuartions found" }]
    }
    console.log("Regenerating configs")
    return configs.map((config) => {
      try {
        return new TagRenderingConfig(config)
      } catch (e) {
        return { error: e }
      }
    })
  })
  let id: Store<string> = value.mapD((c) => {
    if (c?.id) {
      return c.id
    }
    if (typeof c === "string") {
      return c
    }
    return undefined
  })

  let tags = state.testTags

  let messages = state.messagesFor(path)

  let description = schema.description
</script>

<div class="flex">
  <div class="interactive border-interactive m-4 flex w-full flex-col">
    {#if $id}
      TagRendering {$id}
    {/if}
    <NextButton clss="primary" on:click={() => state.highlightedItem.setData({ path, schema })}>
      {#if schema.hints.question}
        {schema.hints.question}
      {/if}
    </NextButton>
    {#if description}
      <Markdown src={description}/>
    {/if}
    {#each $messages as message}
      <ShowConversionMessage {message} />
    {/each}

    <slot class="my-4 self-end" />
  </div>

  <div class="m-4 flex w-full flex-col">
    <h3>Preview of this question</h3>
    {#each $configs as config}
      {#if config.error !== undefined}
        <div class="alert">Could not create a preview of this tagRendering: {config.error}</div>
      {:else if config.condition && !config.condition.matchesProperties($tags)}
        This tagRendering is currently not shown. It will appear if the feature matches the
        condition
        <b>
          <FromHtml src={config.condition.asHumanString(true, false, {})} />
        </b>

        Try to answer the relevant question above
      {:else if config.metacondition && !config.metacondition.matchesProperties($tags)}
        This tagRendering is currently not shown. It will appear if the feature matches the
        metacondition
        <b>
          <FromHtml src={config.metacondition.asHumanString(true, false, {})} />
        </b>
        For a breakdown of usable meta conditions, go to a mapcomplete theme > settings and enable debug-data.
        The meta-tags will appear at the bottom
      {:else}
        <TagRenderingEditable
          selectedElement={state.exampleFeature}
          {config}
          editingEnabled={new ImmutableStore(true)}
          {state}
          {tags}
        />
      {/if}
    {/each}
  </div>
</div>
