<script lang="ts">
  import type { ConfigMeta } from "./configMeta"
  import EditLayerState, { EditJsonState } from "./EditLayerState"
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
      return <any>[x]
    }
  })
  let configs: Store<TagRenderingConfig[]> = configJson.map((configs) => {
    if (!configs) {
      return [{ error: "No configuartions found" }]
    }
    return configs.map((config) => {
      if (config["builtin"]) {
        let override = ""
        if (config["override"]) {
          override =
            ". Some items are changed with an override. Editing this is not yet supported with Studio."
        }
        return new TagRenderingConfig({
          render: {
            en: "This question reuses <b>" + JSON.stringify(config["builtin"]) + "</b>" + override,
          },
        })
      }
      try {
        return new TagRenderingConfig(config)
      } catch (e) {
        return { error: e }
      }
    })
  })

  let tags = state.testTags

  let messages = state.messagesFor(path)

  let description = schema.description
</script>

<div class="flex">
  <div class="m-4 flex w-full flex-col">
    {#if $configJson.some((config) => config["builtin"] !== undefined)}
      <div class="interactive rounded-2xl p-2">
        This question uses an advanced 'builtin'+'override' construction in the source code. Editing
        this with Studio is not supported.
      </div>
    {:else}
      <NextButton clss="primary" on:click={() => state.highlightedItem.setData({ path, schema })}>
        {#if schema.hints.question}
          {schema.hints.question}
        {/if}
      </NextButton>
    {/if}
    {#if description}
      <Markdown src={description} />
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
        {JSON.stringify($value)}
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
