<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { ConfigMeta } from "./configMeta"
  import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte"
  import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"
  import type { QuestionableTagRenderingConfigJson } from "../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"
  import EditLayerState from "./EditLayerState"
  import { onDestroy } from "svelte"
  import type { JsonSchemaType } from "./jsonSchema"
  import { ConfigMetaUtils } from "./configMeta"
  import ShowConversionMessage from "./ShowConversionMessage.svelte"

  export let state: EditLayerState
  export let path: (string | number)[] = []
  export let schema: ConfigMeta
  export let startInEditModeIfUnset: boolean = schema.hints && !schema.hints.ifunset

  function mightBeBoolean(type: undefined | JsonSchemaType): boolean {
    if (type === undefined) {
      return false
    }
    if (type["type"]) {
      type = type["type"]
    }
    if (type === "boolean") {
      return true
    }
    if (!Array.isArray(type)) {
      return false
    }

    return type.some((t) => mightBeBoolean(t))
  }

  const isTranslation =
    schema.hints?.typehint === "translation" ||
    schema.hints?.typehint === "rendered" ||
    ConfigMetaUtils.isTranslation(schema)
  let type = schema.hints.typehint ?? "string"

  let rendervalue =
    (schema.hints.inline ?? schema.path.join(".")) +
    (isTranslation ? " <b>{translated(value)}</b>" : " <b>{value}</b>")

  if (schema.type === "boolean") {
    rendervalue = undefined
  }
  if (schema.hints.typehint === "tag" || schema.hints.typehint === "simple_tag") {
    rendervalue = "{tags()}"
  }

  let helperArgs = schema.hints.typehelper?.split(",")
  let inline = schema.hints.inline !== undefined
  if (isTranslation) {
    type = "translation"
    if (schema.hints.inline) {
      const inlineValue = schema.hints.inline
      rendervalue = inlineValue
      inline = false
      helperArgs = [
        inlineValue.substring(0, inlineValue.indexOf("{")),
        inlineValue.substring(inlineValue.indexOf("}") + 1),
      ]
    }
  }
  if (type.endsWith("[]")) {
    type = type.substring(0, type.length - 2)
  }

  const configJson: QuestionableTagRenderingConfigJson & {questionHintIsMd: boolean} = {
    id: path.join("_"),
    render: rendervalue,
    question: schema.hints.question,
    questionHint: schema.description,
    questionHintIsMd: true,
    freeform:
      schema.type === "boolean"
        ? undefined
        : {
            key: "value",
            type,
            inline,
            helperArgs,
          },
  }

  if (schema.hints.default) {
    configJson.mappings = [
      {
        if: "value=", // We leave this blank
        then:
          path.at(-1) +
          " is not set. The default value <b>" +
          schema.hints.default +
          "</b> will be used. " +
          (schema.hints.ifunset ?? ""),
        hideInAnswer: mightBeBoolean(schema.type),
      },
    ]
  } else if (!schema.required) {
    configJson.mappings = [
      {
        if: "value=",
        then: path.at(-1) + " is not set. " + (schema.hints.ifunset ?? ""),
      },
    ]
  }

  if (mightBeBoolean(schema.type)) {
    configJson.mappings = configJson.mappings ?? []
    configJson.mappings.push(
      {
        if: "value=true",
        then: schema.hints?.iftrue ?? "Yes",
      },
      {
        if: "value=false",
        then: schema.hints?.iffalse ?? "No",
      }
    )
  }

  if (schema.hints.suggestions) {
    if (!configJson.mappings) {
      configJson.mappings = []
    }
    configJson.mappings.push(...schema.hints.suggestions)
  }
  let config: TagRenderingConfig
  let err: string = undefined
  let messages = state.messagesFor(path)
  try {
    config = new TagRenderingConfig(configJson, "config based on " + schema.path.join("."))
  } catch (e) {
    console.error(e, config)
    err = path.join(".") + " " + e
  }
  let startValue = state.getCurrentValueFor(path)
  let startInEditMode = startValue === undefined && startInEditModeIfUnset
  const tags = new UIEventSource<Record<string, string>>({ value: startValue })
  try {
    onDestroy(
      state.register(
        path,
        tags.map((tgs) => {
          const v = tgs["value"]
          if (typeof v === "object") {
            return { ...(<object>v) }
          }
          if (schema.type === "boolean") {
            if (v === null || v === undefined) {
              return v
            }
            return v === "true" || v === "yes" || v === "1"
          }
          if (mightBeBoolean(schema.type)) {
            if (v === "true" || v === "yes" || v === "1") {
              return true
            }
            if (v === "false" || v === "no" || v === "0" || <any>v === false) {
              return false
            }
          }
          if (schema.type === "number") {
            if (v === "" || v === null || isNaN(Number(v))) {
              return undefined
            }
            return Number(v)
          }
          if (isTranslation && typeof v === "string") {
            if (v === "") {
              return {}
            }
            return JSON.parse(v)
          }
          return v
        }),
        isTranslation
      )
    )
  } catch (e) {
    console.error("Could not register", path, "due to", e)
  }
</script>

{#if err !== undefined}
  <span class="alert">{err}</span>
{:else}
  <div class="flex w-full flex-col">
    <TagRenderingEditable
      editMode={startInEditMode}
      {config}
      selectedElement={undefined}
      {state}
      {tags}
    />
    {#if $messages.length > 0}
      {#each $messages as message}
        <ShowConversionMessage {message} />
      {/each}
    {/if}
    {#if window.location.hostname === "127.0.0.1"}
      <span class="subtle" on:click={() => console.log(schema)}>
        SchemaBasedField <b>{path.join(".")}</b>
        <span class="cursor-pointer" on:click={() => console.log(schema)}>
          {schema.hints.typehint}
        </span>
        Group: {schema.hints.group}
      </span>
    {/if}
  </div>
{/if}
