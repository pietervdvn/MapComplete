<script lang="ts">
  import Translations from "../i18n/Translations"
  import type { ConfigMeta } from "./configMeta"
  import Icon from "../Map/Icon.svelte"
  import Tr from "../Base/Tr.svelte"
  import { Translation } from "../i18n/Translation"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import SchemaBasedInput from "./SchemaBasedInput.svelte"
  import { TrashIcon } from "@babeard/svelte-heroicons/mini"
  import QuestionPreview from "./QuestionPreview.svelte"
  import SchemaBasedMultiType from "./SchemaBasedMultiType.svelte"
  import { EditJsonState } from "./EditLayerState"
  import type { QuestionableTagRenderingConfigJson } from "../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"
  import { AccordionItem } from "flowbite-svelte"

  export let state: EditJsonState<any>

  export let isTagRenderingBlock: boolean
  export let schema: ConfigMeta
  export let currentValue: UIEventSource<(string | QuestionableTagRenderingConfigJson)[]>

  export let value: any
  export let singular: string
  export let i: number
  export let path: (string | number)[] = []

  export let expanded = new UIEventSource(false)

  const subparts: ConfigMeta[] = state
    .getSchemaStartingWith(schema.path)
    .filter((part) => part.path.length - 1 === schema.path.length)

  let usesOverride = value?.["builtin"] !== undefined

  function schemaForMultitype() {
    const sch = { ...schema }
    sch.hints.typehint = undefined
    return sch
  }

  function fusePath(subpartPath: string[]): (string | number)[] {
    const newPath = [...path] // has indices, e.g. ["A", 1, "B", "C", 2]
    const toAdd = [...subpartPath] // doesn't have indices, e.g. ["A", "B", "C", "D"]

    let indexInToAdd = 0
    for (let i = 0; i < newPath.length; i++) {
      if (newPath[i] === toAdd[indexInToAdd]) {
        indexInToAdd++
      }
    }

    // indexToAdd should now point to the last common index, '2' in the example
    const resting = toAdd.slice(indexInToAdd)

    newPath.push(...resting)
    return newPath
  }

  function del(i: number) {
    expanded.setData(false)
    currentValue.data.splice(i, 1)
    currentValue.ping()
  }

  function swap(i: number, j: number) {
    expanded.setData(false)
    const x = currentValue.data[i]
    currentValue.data[i] = currentValue.data[j]
    currentValue.data[j] = x
    currentValue.ping()
  }

  function moveTo(source: number, target: number) {
    expanded.setData(false)
    const x = currentValue.data[source]
    currentValue.data.splice(source, 1)
    currentValue.data.splice(target, 0, x)
    currentValue.ping()
  }

  function genTitle(value: any, singular: string, i: number): Translation {
    try {
      if (schema.hints.title) {
        const v = Function("value", "return " + schema.hints.title)(value)
        return Translations.T(v)
      }
    } catch (e) {
      console.log(
        "Warning: could not translate a title for " +
          `${singular} ${i} with function ` +
          schema.hints.title +
          " and value " +
          JSON.stringify(value)
      )
    }
    return Translations.T(`${singular} ${i}`)
  }

  let genIconF: (x: any) => { icon: string; color: string } = <any>(
    Function("value", "return " + schema.hints.icon)
  )

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

<AccordionItem open={$expanded} paddingDefault="p-0" inactiveClass="text-black m-0">
  <div slot="header" class="m-0 w-full p-1 text-base text-black">
    {#if !isTagRenderingBlock}
      <div class="flex w-full items-center justify-between">
        <div class="m-0 flex">
          {#if schema.hints.icon}
            <Icon clss="w-6 h-6" icon={genIcon(value)} color={genColor(value)} />
          {/if}
          {#if schema.hints.title}
            <Tr t={genTitle(value, singular, i)} />
            <div class="subtle ml-2">
              {singular}
              {i}
            </div>
          {:else}
            {singular}
            {i}
          {/if}
        </div>
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
    {:else if value?.["builtin"]}
      reused tagrendering <span class="font-bold">{JSON.stringify(value["builtin"])}</span>
    {:else}
      <Tr cls="font-bold" t={Translations.T(value?.question ?? value?.render)} />
    {/if}
  </div>
  <div class="normal-background border border-gray-300 p-2">
    {#if usesOverride}
      This block uses an builtin/override construction and cannot be edited in Studio. Edit the code
      directly
    {:else if isTagRenderingBlock}
      <QuestionPreview {state} {path} {schema}>
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
      <SchemaBasedMultiType {state} path={[...path, i]} schema={schemaForMultitype()} />
    {:else}
      {#each subparts as subpart}
        <SchemaBasedInput {state} path={fusePath(subpart.path)} schema={subpart} />
      {/each}
    {/if}
  </div>
</AccordionItem>
