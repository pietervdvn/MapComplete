<script lang="ts">
  /**
   * Little helper class to deal with choosing a builtin tagRendering or defining one yourself.
   * Breaks the ideology that everything should be schema based
   */
  import EditLayerState from "./EditLayerState"
  import type { ConfigMeta } from "./configMeta"
  import type {
    MappingConfigJson,
    QuestionableTagRenderingConfigJson
  } from "../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"
  import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"
  import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import * as questions from "../../assets/generated/layers/questions.json"
  import MappingInput from "./MappingInput.svelte"
  import { TrashIcon } from "@rgossiaux/svelte-heroicons/outline"
  import questionableTagRenderingSchemaRaw from "../../assets/schemas/questionabletagrenderingconfigmeta.json"
  import SchemaBasedField from "./SchemaBasedField.svelte"
  import Region from "./Region.svelte"
  import NextButton from "../Base/NextButton.svelte"
  import { QuestionMarkCircleIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { LocalStorageSource } from "../../Logic/Web/LocalStorageSource"
  import { onMount } from "svelte"

  export let state: EditLayerState
  export let path: ReadonlyArray<string | number>
  let expertMode = state.expertMode
  const store = state.getStoreFor(path)
  let value = store.data
  let hasSeenIntro = UIEventSource.asBoolean(
    LocalStorageSource.Get("studio-seen-tagrendering-tutorial", "false")
  )
  onMount(() => {
    if (!hasSeenIntro.data) {
      state.showIntro.setData("tagrenderings")
      hasSeenIntro.setData(true)
    }
  })
  /**
   * Allows the theme builder to create 'writable' themes.
   * Should only be enabled for 'tagrenderings' in the theme, if the source is OSM
   */
  let allowQuestions: Store<boolean> = state.configuration.mapD(
    (config) => path.at(0) === "tagRenderings" && config.source?.["geoJson"] === undefined
  )

  let mappingsBuiltin: MappingConfigJson[] = []
  let perLabel: Record<string, MappingConfigJson> = {}
  for (const tr of questions.tagRenderings) {
    let description = tr["description"] ?? tr["question"] ?? "No description available"
    description = description["en"] ?? description
    if (tr["labels"]) {
      const labels: string[] = tr["labels"]
      for (const label of labels) {
        let labelMapping: MappingConfigJson = perLabel[label]

        if (!labelMapping) {
          labelMapping = {
            if: "value=" + label,
            then: {
              en: "Builtin collection <b>" + label + "</b>:"
            }
          }
          perLabel[label] = labelMapping
          mappingsBuiltin.push(labelMapping)
        }
        labelMapping.then.en = labelMapping.then.en + "<div>" + description + "</div>"
      }
    }

    mappingsBuiltin.push({
      if: "value=" + tr["id"],
      then: {
        en: "Builtin <b>" + tr["id"] + "</b> <div class='subtle'>" + description + "</div>"
      }
    })
  }

  const configBuiltin = new TagRenderingConfig(<QuestionableTagRenderingConfigJson>{
    question: "Which builtin element should be shown?",
    mappings: mappingsBuiltin
  })

  const tags = new UIEventSource({ value })

  tags.addCallbackAndRunD((tgs) => {
    store.setData(tgs["value"])
  })

  let mappings: UIEventSource<MappingConfigJson[]> = state.getStoreFor([...path, "mappings"])

  const topLevelItems: Record<string, ConfigMeta> = {}
  for (const item of questionableTagRenderingSchemaRaw) {
    if (item.path.length === 1) {
      topLevelItems[item.path[0]] = <ConfigMeta>item
    }
  }

  function initMappings() {
    if (mappings.data === undefined) {
      mappings.setData([])
    }
  }

  const items = new Set([
    "question",
    "questionHint",
    "multiAnswer",
    "freeform",
    "render",
    "condition",
    "metacondition",
    "mappings",
    "icon"
  ])
  const ignored = new Set(["labels", "description", "classes"])

  const freeformSchemaAll = <ConfigMeta[]>(
    questionableTagRenderingSchemaRaw.filter(
      (schema) => schema.path.length == 2 && schema.path[0] === "freeform" && $allowQuestions
    )
  )
  let freeformSchema = $expertMode
    ? freeformSchemaAll
    : freeformSchemaAll.filter((schema) => schema.hints?.group !== "expert")
  const missing: string[] = questionableTagRenderingSchemaRaw
    .filter(
      (schema) =>
        schema.path.length >= 1 && !items.has(schema.path[0]) && !ignored.has(schema.path[0])
    )
    .map((schema) => schema.path.join("."))
  console.log({ state })
</script>

{#if typeof $store === "string"}
  <div class="low-interaction flex">
    <TagRenderingEditable config={configBuiltin} selectedElement={undefined} {state} {tags} />
    <slot name="upper-right" />
  </div>
{:else}
  <div class="flex w-full flex-col gap-y-1 p-1 pr-12">
    <div class="flex justify-end">
      <slot name="upper-right" />
    </div>
    {#if $allowQuestions}
      <SchemaBasedField
        startInEditModeIfUnset={true}
        {state}
        path={[...path, "question"]}
        schema={topLevelItems["question"]}
      />
      <SchemaBasedField
        {state}
        path={[...path, "questionHint"]}
        schema={topLevelItems["questionHint"]}
      />
    {/if}
    {#each $mappings ?? [] as mapping, i (mapping)}
      <div class="interactive flex w-full">
        <MappingInput {state} path={[...path, "mappings", i]}>
          <button
            slot="delete"
            class="no-image-background rounded-full"
            on:click={() => {
              initMappings()
              mappings.data.splice(i, 1)
              mappings.ping()
            }}
          >
            <TrashIcon class="h-4 w-4" />
          </button>
        </MappingInput>
      </div>
    {/each}

    <button
      class="primary"
      on:click={() => {
        initMappings()
        mappings.data.push({ if: undefined, then: {} })
        mappings.ping()
      }}
    >
      Add a predefined option
    </button>

    {#if $allowQuestions}
      <SchemaBasedField
        {state}
        path={[...path, "multiAnswer"]}
        schema={topLevelItems["multiAnswer"]}
      />
    {/if}

    <h3>Text field and input element configuration</h3>
    <div class="border-l border-dashed border-gray-800 pl-2">
      <SchemaBasedField {state} path={[...path, "render"]} schema={topLevelItems["render"]} />
      {#if freeformSchema?.length > 0}
        <!-- In read-only cases, (e.g. popup title) there will be no freeform-schema to set and thus freeformSchema will be undefined -->
        <Region {state} {path} configs={freeformSchema} />
      {/if}
      <SchemaBasedField {state} path={[...path, "icon"]} schema={topLevelItems["icon"]} />
    </div>

    <SchemaBasedField {state} path={[...path, "condition"]} schema={topLevelItems["condition"]} />
    {#if $expertMode}
      <SchemaBasedField
        {state}
        path={[...path, "metacondition"]}
        schema={topLevelItems["metacondition"]}
      />
    {/if}
    {#each missing as field}
      <SchemaBasedField {state} path={[...path, field]} schema={topLevelItems[field]} />
    {/each}

    <NextButton clss="small mt-8" on:click={() => state.showIntro.setData("tagrenderings")}>
      <QuestionMarkCircleIcon class="h-6 w-6" />
      Show the introduction again
    </NextButton>
  </div>
{/if}
