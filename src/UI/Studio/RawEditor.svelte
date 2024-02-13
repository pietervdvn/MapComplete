<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import EditLayerState, { EditThemeState } from "./EditLayerState"
  import loader from "@monaco-editor/loader"
  import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api"
  import layerSchemaJSON from "../../../Docs/Schemas/LayerConfigJson.schema.json"
  import layoutSchemaJSON from "../../../Docs/Schemas/LayoutConfigJson.schema.json"

  export let state: EditLayerState | EditThemeState

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

  onMount(async () => {
    const monacoEditor = await import("monaco-editor")
    loader.config({
      monaco: monacoEditor.default,
    })

    monaco = await loader.init()

    // Determine schema based on the state
    let schemaUri: string
    if (state instanceof EditLayerState) {
      schemaUri = "https://mapcomplete.org/schemas/layerconfig.json"
    } else {
      schemaUri = "https://mapcomplete.org/schemas/layoutconfig.json"
    }

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
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

    let modelUri = monaco.Uri.parse("inmemory://inmemory/file.json")

    // Create a new model
    model = monaco.editor.createModel(
      JSON.stringify(state.configuration.data, null, "  "),
      "json",
      modelUri
    )

    editor = monaco.editor.create(container, {
      model,
      automaticLayout: true,
    })

    // When the editor is changed, update the configuration, but only if the user hasn't typed for 500ms and the JSON is valid
    let timeout: number
    editor.onDidChangeModelContent(() => {
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

<div bind:this={container} class="h-full w-full" />
