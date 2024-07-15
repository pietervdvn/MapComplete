<script lang="ts">
  import EditLayerState from "./EditLayerState"
  import type { ConfigMeta } from "./configMeta"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import SchemaBasedInput from "./SchemaBasedInput.svelte"
  import SchemaBasedField from "./SchemaBasedField.svelte"
  import { TrashIcon } from "@babeard/svelte-heroicons/mini"
  import QuestionPreview from "./QuestionPreview.svelte"
  import SchemaBasedMultiType from "./SchemaBasedMultiType.svelte"
  import ShowConversionMessage from "./ShowConversionMessage.svelte"
  import Markdown from "../Base/Markdown.svelte"
  import AccordionSingle from "../Flowbite/AccordionSingle.svelte"
  import Icon from "../Map/Icon.svelte"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"

  export let state: EditLayerState
  export let schema: ConfigMeta

  let title = schema.path.at(-1)
  console.log(">>>", schema)
  let singular = title
  if (title?.endsWith("s")) {
    singular = title.slice(0, title.length - 1)
  }
  let article = "a"
  if (singular?.match(/^[aeoui]/)) {
    article = "an"
  }
  export let path: (string | number)[] = []

  const isTagRenderingBlock = path.length === 1 && path[0] === "tagRenderings"

  if (isTagRenderingBlock) {
    schema = { ...schema }
    schema.description = undefined
  }

  const subparts: ConfigMeta[] = state
    .getSchemaStartingWith(schema.path)
    .filter((part) => part.path.length - 1 === schema.path.length)
  let messages = state.messagesFor(path)

  const currentValue: UIEventSource<any[]> = state.getStoreFor(path)
  if (currentValue.data === undefined) {
    currentValue.setData([])
  }

  function createItem(valueToSet?: any) {
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

  function schemaForMultitype() {
    const sch = { ...schema }
    sch.hints.typehint = undefined
    return sch
  }

  function del(i: number) {
    currentValue.data.splice(i, 1)
    currentValue.ping()
  }

  function swap(i: number, j: number) {
    const x = currentValue.data[i]
    currentValue.data[i] = currentValue.data[j]
    currentValue.data[j] = x
    currentValue.ping()
  }

  function moveTo(source: number, target: number) {
    const x = currentValue.data[source]
    currentValue.data.splice(source, 1)
    currentValue.data.splice(target, 0, x)
    currentValue.ping()
  }

  function genTitle(value: any, singular: string, i: number) {
    if (schema.hints.title) {
      return Function("value", "return " + schema.hints.title)(value)
    }
    return `${singular} ${i}`
  }

  let genIconF: (x: any) => { icon: string; color: string } = <any>(
    Function("value", "return " + schema.hints.icon)
  )
  console.log("Icon lambda is", schema.hints.icon, path, genIconF("test"))

  function genIcon(value: any): string {
    return genIconF(value)?.icon
  }

  function genColor(value: any): string {
    if (!schema.hints.icon) {
      return undefined
    }
    return genIconF(value)?.color
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
    {#each $currentValue as value, i}
      <AccordionSingle expanded={false}>
        <span slot="header">
          {#if !isTagRenderingBlock}
            <div class="flex items-center justify-between">
              <h3 class="m-0 flex">
                {#if schema.hints.icon}
                  <Icon clss="w-6 h-6" icon={genIcon(value)} color={genColor(value)} />
                {/if}
                {singular}
                {i}

                {#if schema.hints.title}
                  <div class="subtle ml-2">
                    <Tr t={Translations.T(genTitle(value, singular, i))} />
                  </div>
                {/if}
              </h3>
              <button
                class="h-fit w-fit rounded-full border border-black p-1"
                on:click={() => {
                  del(i)
                }}
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          {:else if typeof value === "string"}
            Builtin: <b>{value}</b>
          {:else}
            <Tr cls="font-bold" t={Translations.T(value?.question ?? value?.render)}/>
          {/if}
        </span>
        <div class="normal-background p-2">
          {#if isTagRenderingBlock}
            <QuestionPreview {state} path={fusePath(i, [])} {schema}>
              <button
                on:click={() => {
                  del(i)
                }}
              >
                <TrashIcon class="h-4 w-4" />
                Delete this question
              </button>

              {#if i > 0}
                <button
                  on:click={() => {
                    moveTo(i, 0)
                  }}
                >
                  Move to front
                </button>

                <button
                  on:click={() => {
                    swap(i, i - 1)
                  }}
                >
                  Move up
                </button>
              {/if}
              {#if i + 1 < $currentValue.length}
                <button
                  on:click={() => {
                    swap(i, i + 1)
                  }}
                >
                  Move down
                </button>
                <button
                  on:click={() => {
                    moveTo(i, $currentValue.length - 1)
                  }}
                >
                  Move to back
                </button>
              {/if}
            </QuestionPreview>
          {:else if schema.hints.types}
            <SchemaBasedMultiType {state} path={fusePath(i, [])} schema={schemaForMultitype()} />
          {:else}
            {#each subparts as subpart}
              <SchemaBasedInput
                {state}
                path={fusePath(i, [subpart.path.at(-1)])}
                schema={subpart}
              />
            {/each}
          {/if}
        </div>
      </AccordionSingle>
    {/each}
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
