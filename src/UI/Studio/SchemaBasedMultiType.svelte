<script lang="ts">
  import EditLayerState from "./EditLayerState"
  import type { ConfigMeta } from "./configMeta"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { QuestionableTagRenderingConfigJson } from "../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"
  import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte"
  import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"
  import { onDestroy } from "svelte"
  import SchemaBasedInput from "./SchemaBasedInput.svelte"
  import type { JsonSchemaType } from "./jsonSchema"
  import ShowConversionMessage from "./ShowConversionMessage.svelte"
  import type { Translatable } from "../../Models/ThemeConfig/Json/Translatable"

  /**
   * If 'types' is defined: allow the user to pick one of the types to input.
   */

  export let state: EditLayerState
  export let path: (string | number)[] = []
  export let schema: ConfigMeta
  let expertMode = state.expertMode
  const defaultOption = schema.hints.typesdefault ? Number(schema.hints.typesdefault) : undefined

  const hasBooleanOption = (<JsonSchemaType[]>schema.type)?.findIndex(
    (t) => t["type"] === "boolean"
  )
  const types = schema.hints.types.split(";")
  if (hasBooleanOption >= 0) {
    types.splice(hasBooleanOption)
  }

  let lastIsString = false
  {
    const types: string | string[] = Array.isArray(schema.type)
      ? schema.type[schema.type.length - 1].type
      : []
    lastIsString = types === "string" || (Array.isArray(types) && types.some((i) => i === "string"))
  }

  if (lastIsString) {
    types.splice(types.length - 1, 1)
  }
  const configJson: QuestionableTagRenderingConfigJson  & {questionHintIsMd: boolean}= {
    id: "TYPE_OF:" + path.join("_"),
    question: schema.hints.question ?? "Which subcategory is needed for " + schema.path.at(-1) + "?",
    questionHint: schema.description,
    questionHintIsMd: true,
    mappings: types
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0)
      .map((opt, i) => ({
        if: "chosen_type_index=" + i,
        addExtraTags: ["value="],
        then: opt + (i === defaultOption ? " (Default)" : ""),
      })),
    render: !lastIsString
      ? undefined
      : schema.hints.inline ?? "Use a hardcoded value: <b>{value}</b>",
    freeform: !lastIsString
      ? undefined
      : {
          key: "value",
          inline: true,
          type: schema.hints.typehint,
          addExtraTags: ["chosen_type_index="],
        },
  }
  let tags = new UIEventSource<Record<string, string>>({})

  if (schema.hints.ifunset) {
    configJson.mappings.push({
      if: { and: ["value=", "chosen_type_index="] },
      then: schema.hints.ifunset,
    })
  }
  if (schema.hints.suggestions) {
    configJson.mappings.push(...schema.hints.suggestions)
  }

  if (hasBooleanOption >= 0) {
    configJson.mappings.unshift(
      {
        if: "value=true",
        then: schema.hints.iftrue ?? "Yes",
        addExtraTags: ["chosen_type_index="],
      },
      {
        if: "value=false",
        then: schema.hints.iffalse ?? "No",
        addExtraTags: ["chosen_type_index="],
      }
    )
  }
  const config = new TagRenderingConfig(configJson, "config based on " + schema.path.join("."))
  let chosenOption: number = defaultOption

  const existingValue = state.getCurrentValueFor(path)
  let hasOverride = existingValue?.override !== undefined
  if (hasBooleanOption >= 0 && (existingValue === true || existingValue === false)) {
    tags.setData({ value: "" + existingValue })
  } else if (lastIsString && typeof existingValue === "string") {
    tags.setData({ value: existingValue })
    chosenOption = undefined
  } else if (existingValue) {
    // We found an existing value. Let's figure out what type it matches and select that one
    // We run over all possibilities and check what is required
    const possibleTypes: {
      index: number
      matchingPropertiesCount: number
      optionalMatches: number
    }[] = []
    outer: for (let i = 0; i < (<[]>schema.type).length; i++) {
      const type = schema.type[i]
      let optionalMatches = 0
      for (const key of Object.keys(type.properties ?? {})) {
        if (!!existingValue[key]) {
          optionalMatches++
        }
      }
      if (type.required) {
        let numberOfMatches = 0

        for (const requiredAttribute of type.required) {
          if (existingValue[requiredAttribute] === undefined) {
            // The 'existingValue' does _not_ have this required attribute, so it cannot be of this type
            continue outer
          }
          numberOfMatches++
        }
        possibleTypes.push({ index: i, matchingPropertiesCount: numberOfMatches, optionalMatches })
      } else {
        possibleTypes.push({ index: i, matchingPropertiesCount: 0, optionalMatches })
      }
    }
    possibleTypes.sort((a, b) => b.optionalMatches - a.optionalMatches)
    possibleTypes.sort((a, b) => b.matchingPropertiesCount - a.matchingPropertiesCount)
    if (possibleTypes.length > 0) {
      chosenOption = possibleTypes[0].index
      tags.setData({ chosen_type_index: "" + chosenOption })
    }
  } else if (defaultOption !== undefined) {
    tags.setData({ chosen_type_index: "" + defaultOption })
  } else {
    chosenOption = defaultOption
  }

  if (hasBooleanOption >= 0 || lastIsString) {
    const directValue = tags.mapD((tags) => {
      if (tags["chosen_type_index"]) {
        return ""
      }
      if (lastIsString) {
        return tags["value"]
      }
      return tags["value"] === "true"
    })
    onDestroy(state.register(path, directValue))
  }

  let subSchemas: ConfigMeta[] = []

  let subpath = path
  const store = state.getStoreFor(path)
  onDestroy(
    tags.addCallbackAndRun((tags) => {
      if (tags["value"] !== undefined && tags["value"] !== "") {
        chosenOption = undefined
        return
      }
      const oldOption = chosenOption
      chosenOption = tags["chosen_type_index"] ? Number(tags["chosen_type_index"]) : defaultOption
      const type = schema.type[chosenOption]
      if (chosenOption !== oldOption) {
        // Reset the values beneath
        subSchemas = []
        const o = state.getCurrentValueFor(path) ?? {}
        for (const key of type?.required ?? []) {
          o[key] ??= {}
        }
        store.setData(o)
      }
      if (!type) {
        return
      }
      subpath = path
      const cleanPath = <string[]>path.filter((p) => typeof p === "string")
      if (type["$ref"] === "#/definitions/Record<string,string>") {
        // The subtype is a translation object
        const schema = state.getTranslationAt(cleanPath)
        subSchemas.push(schema)
        subpath = path.slice(0, path.length - 2)
        return
      }
      if (!type.properties) {
        return
      }
      for (const crumble of Object.keys(type.properties)) {
        subSchemas.push(...state.getSchema([...cleanPath, crumble]))
      }
    })
  )
  let messages = state.messagesFor(path)
</script>

<div class="m-1 flex flex-col gap-y-2 border-2 border-dashed border-gray-300 p-2">
  {#if schema.hints.title !== undefined}
    <h3>{schema.hints.title}</h3>
    <div>{schema.description}</div>
  {/if}
  {#if hasOverride}
    This object refers to {existingValue.builtin} and overrides some properties. This cannot be edited
    with MapComplete Studio
  {:else}
    <div>
      <TagRenderingEditable {config} selectedElement={undefined} {state} {tags} />
    </div>

    {#if chosenOption !== undefined}
      {#each subSchemas as subschema}
        {#if $expertMode || subschema.hints?.group !== "expert"}
          <SchemaBasedInput
            {state}
            schema={subschema}
            path={[...subpath, subschema?.path?.at(-1) ?? "???"]}
          />
        {:else if window.location.hostname === "127.0.0.1"}
          <span class="subtle">Omitted expert question {subschema.path.join(".")}</span>
        {/if}
      {/each}
    {:else if $messages.length > 0}
      {#each $messages as message}
        <ShowConversionMessage {message} />
      {/each}
    {/if}
  {/if}
  {#if window.location.hostname === "127.0.0.1"}
    <span class="subtle">
      SchemaBasedMultiType <b>{path.join(".")}</b>
      <span class="cursor-pointer" on:click={() => console.log(schema)}>
        {schema.hints.typehint}
      </span>
    </span>
  {/if}
</div>
