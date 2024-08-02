<script lang="ts">
  import { EditJsonState } from "./EditLayerState"
  import type { ConfigMeta } from "./configMeta"
  import SchemaBasedField from "./SchemaBasedField.svelte"
  import { TrashIcon } from "@babeard/svelte-heroicons/mini"
  import ShowConversionMessage from "./ShowConversionMessage.svelte"
  import Markdown from "../Base/Markdown.svelte"
  import { Utils } from "../../Utils"
  import type { QuestionableTagRenderingConfigJson } from "../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"
  import CollapsedTagRenderingPreview from "./CollapsedTagRenderingPreview.svelte"
  import { Accordion } from "flowbite-svelte"

  export let state: EditJsonState<any>
  export let path: (string | number)[] = []
  export let schema: ConfigMeta

  schema = Utils.Clone(schema)
  let title = schema.path.at(-1)
  let singular = title
  if (title?.endsWith("s")) {
    singular = title.slice(0, title.length - 1)
  }
  let article = "a"
  if (singular?.match(/^[aeoui]/)) {
    article = "an"
  }

  const isTagRenderingBlock = path.length === 1 && path[0] === "tagRenderings"

  if (isTagRenderingBlock) {
    schema = { ...schema }
    schema.description = undefined
  }

  const subparts: ConfigMeta[] = state
    .getSchemaStartingWith(schema.path)
    .filter((part) => part.path.length - 1 === schema.path.length)
  let messages = state.messagesFor(path)

  const currentValue = state.getStoreFor<(string | QuestionableTagRenderingConfigJson)[]>(path)
  if (currentValue.data === undefined) {
    currentValue.setData([])
  }

  function createItem(valueToSet?: string | QuestionableTagRenderingConfigJson) {
    if (currentValue.data === undefined) {
      currentValue.setData([])
    }
    currentValue.data.push(valueToSet)
    currentValue.ping()

    if (isTagRenderingBlock) {
      state.highlightedItem.setData({ path: [...path, currentValue.data.length - 1], schema })
    }
  }

  function fusePath(i: number, subpartPath: string[]): (string | number)[] {
    const newPath = [...path, i]
    const toAdd = [...subpartPath]
    for (const part of path) {
      if (toAdd[0] === part) {
        toAdd.splice(0, 1)
      } else {
        break
      }
    }
    newPath.push(...toAdd)
    return newPath
  }

  function del(i: number) {
    currentValue.data.splice(i, 1)
    currentValue.ping()
  }



</script>

<div class="pl-2">
  <h3>{schema.path.at(-1)}</h3>

  {#if subparts.length > 0}
    <Markdown src={schema.description} />
  {/if}
  {#if $currentValue === undefined}
    No array defined
  {:else if $currentValue.length === 0}
    No values are defined
    {#if $messages.length > 0}
      {#each $messages as message}
        <ShowConversionMessage {message} />
      {/each}
    {/if}
    {:else if subparts.length === 0}
    <!-- We need an array of values, so we use the typehint of the _parent_ element as field -->
    {#each $currentValue as value, i}
      <div class="flex w-full">
        <SchemaBasedField {state} {schema} path={fusePath(i, [])} />
        <button
          class="h-fit w-fit rounded-full border border-black p-1"
          on:click={() => {
            del(i)
          }}
        >
          <TrashIcon class="h-4 w-4" />
        </button>
      </div>
    {/each}
  {:else}
    <Accordion>
    {#each $currentValue as value, i  (value)}
      <CollapsedTagRenderingPreview {state} {isTagRenderingBlock} {schema} {currentValue} {value} {i} {singular} path={fusePath(i, [])}/>
    {/each}
    </Accordion>
  {/if}
  <div class="flex">
    <button on:click={() => createItem()}>Add {article} {singular}</button>
    {#if path.length === 1 && path[0] === "tagRenderings"}
      <button
        on:click={() => {
          createItem("images")
        }}
      >
        Add a builtin tagRendering
      </button>
    {/if}
    <slot name="extra-button" />
  </div>
</div>
