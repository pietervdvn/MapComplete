<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import EditLayerState, { EditThemeState } from "./EditLayerState"
  import loader from "@monaco-editor/loader"
  import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api"
  import layerSchemaJSON from "../../../Docs/Schemas/LayerConfigJson.schema.json"
  import layoutSchemaJSON from "../../../Docs/Schemas/LayoutConfigJson.schema.json"

  export let state: EditLayerState | EditThemeState

  let rawConfig = state.configuration.sync(f => JSON.stringify(f, null, "  "), [], json => {
    try {
      return JSON.parse(json)
    } catch (e) {
      console.error("Could not parse", json)
      return undefined
    }
  })

  let container: HTMLDivElement
  let monaco: typeof Monaco
  let editor: Monaco.editor.IStandaloneCodeEditor
  let model: Monaco.editor.ITextModel

  function save() {
    try {
      const newConfig = JSON.parse(editor.getValue())
      state.configuration.setData(newConfig)
    } catch (e) {
      console.error(e)
    }
  }

  // Catch keyboard shortcuts
  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        save()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  })

  let useFallback = false
  onMount(async () => {
    const monacoEditor = await import("monaco-editor")
    loader.config({
      monaco: monacoEditor.default,
    })

    try {
      monaco = await loader.init()
    } catch (e) {
      console.error("Could not load Monaco Editor, falling back", e)
      useFallback = true
    }

    // Determine schema based on the state
    let schemaUri: string
    if (state instanceof EditLayerState) {
      schemaUri = "https://mapcomplete.org/schemas/layerconfig.json"
    } else {
      schemaUri = "https://mapcomplete.org/schemas/layoutconfig.json"
    }

    monaco?.languages?.json?.jsonDefaults?.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: schemaUri,
          fileMatch: ["file.json"],
          schema:
            schemaUri === "https://mapcomplete.org/schemas/layerconfig.json"
              ? layerSchemaJSON
              : layoutSchemaJSON,
        },
      ],
    })

    let modelUri = monaco?.Uri?.parse("inmemory://inmemory/file.json")

    // Create a new model
    try {
      model = monaco?.editor?.createModel(
        JSON.stringify(state.configuration.data, null, "  "),
        "json",
        modelUri,
      )
    } catch (e) {
      console.error("Could not create model in MOnaco Editor", e)
      useFallback = true
    }

    editor = monaco?.editor?.create(container, {
      model,
      automaticLayout: true,
    })

    // When the editor is changed, update the configuration, but only if the user hasn't typed for 500ms and the JSON is valid
    let timeout: number
    editor?.onDidChangeModelContent(() => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        save()
      }, 500)
    })
  })

  onDestroy(() => {
    if (editor) {
      editor.dispose()
    }
    if (model) {
      model.dispose()
    }
  })
</script>

{#if useFallback}
  <textarea class="w-full" rows="25" bind:value={$rawConfig} />
{:else}
  <div bind:this={container} class="h-full w-full" />
{/if}
