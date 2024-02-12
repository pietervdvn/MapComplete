<script lang="ts">
  import type { HighlightedTagRendering } from "./EditLayerState"
  import EditLayerState from "./EditLayerState"
  import layerSchemaRaw from "../../assets/schemas/layerconfigmeta.json"
  import Region from "./Region.svelte"
  import TabbedGroup from "../Base/TabbedGroup.svelte"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import type { ConfigMeta } from "./configMeta"
  import { Utils } from "../../Utils"
  import type { ConversionMessage } from "../../Models/ThemeConfig/Conversion/Conversion"
  import ErrorIndicatorForRegion from "./ErrorIndicatorForRegion.svelte"
  import { ChevronRightIcon, TrashIcon } from "@rgossiaux/svelte-heroicons/solid"
  import SchemaBasedInput from "./SchemaBasedInput.svelte"
  import FloatOver from "../Base/FloatOver.svelte"
  import TagRenderingInput from "./TagRenderingInput.svelte"
  import FromHtml from "../Base/FromHtml.svelte"
  import AllTagsPanel from "../Popup/AllTagsPanel.svelte"
  import QuestionPreview from "./QuestionPreview.svelte"
  import ShowConversionMessages from "./ShowConversionMessages.svelte"
  import loader from "@monaco-editor/loader"
  import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api"
  import { onMount } from "svelte"
  import layerSchemaJSON from "../../../Docs/Schemas/LayerConfigJson.schema.json"

  const layerSchema: ConfigMeta[] = <any>layerSchemaRaw

  export let state: EditLayerState

  // Throw error if we don't have a state
  if (!state) {
    throw new Error("No state provided")
  }

  export let backToStudio: () => void
  let messages = state.messages
  let hasErrors = messages.mapD(
    (m: ConversionMessage[]) => m.filter((m) => m.level === "error").length
  )
  const configuration = state.configuration

  const allNames = Utils.Dedup(layerSchema.map((meta) => meta.hints.group))

  const perRegion: Record<string, ConfigMeta[]> = {}
  for (const region of allNames) {
    perRegion[region] = layerSchema.filter((meta) => meta.hints.group === region)
  }

  let title: Store<string> = state.getStoreFor(["id"])
  const wl = window.location
  const baseUrl = wl.protocol + "//" + wl.host + "/theme.html?userlayout="

  function firstPathsFor(...regionNames: string[]): Set<string> {
    const pathNames = new Set<string>()
    for (const regionName of regionNames) {
      const region: ConfigMeta[] = perRegion[regionName]
      for (const configMeta of region) {
        pathNames.add(configMeta.path[0])
      }
    }
    return pathNames
  }

  function configForRequiredField(id: string): ConfigMeta {
    let config = layerSchema.find((config) => config.path.length === 1 && config.path[0] === id)
    config = Utils.Clone(config)
    config.required = true
    config.hints.ifunset = undefined
    return config
  }

  let requiredFields = ["id", "name", "description", "source"]
  let currentlyMissing = state.configuration.map((config) => {
    if (!config) {
      return []
    }
    const missing = []
    for (const requiredField of requiredFields) {
      if (!config[requiredField]) {
        missing.push(requiredField)
      }
    }
    return missing
  })

  let highlightedItem: UIEventSource<HighlightedTagRendering> = state.highlightedItem

  function deleteLayer() {
    state.delete()
    backToStudio()
  }

  let tabbedGroup: TabbedGroup
  let openTab: UIEventSource<number> = new UIEventSource<number>(0)

  let monaco: typeof Monaco
  let editorContainer: HTMLDivElement
  let layerEditor: Monaco.editor.IStandaloneCodeEditor
  let model: Monaco.editor.ITextModel

  onMount(async () => {
    openTab = tabbedGroup.getTab()

    const monacoEditor = await import("monaco-editor")
    loader.config({ monaco: monacoEditor.default })

    monaco = await loader.init()

    // Prepare the Monaco editor (language settings)
    // A.K.A. The schemas for the Monaco editor
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: "https://mapcomplete.org/schemas/layerconfig.json",
          fileMatch: ["layer.json"],
          schema: layerSchemaJSON,
        },
      ],
    })
    let modelUri = monaco.Uri.parse("inmemory://inmemory/layer.json")
    model = monaco.editor.createModel(
      JSON.stringify(state.configuration.data, null, "  "),
      "json",
      modelUri
    )

    layerEditor = monaco.editor.create(editorContainer, {
      model: model,
      automaticLayout: true,
    })

    // When the editor is changed, update the configuration, but only if the user hasn't typed for 500ms and the JSON is valid
    let timeout: number
    layerEditor.onDidChangeModelContent(() => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        try {
          const newConfig = JSON.parse(layerEditor.getValue())
          state.configuration.setData(newConfig)
        } catch (e) {
          console.error(e)
        }
      }, 500)
    })
  })
</script>

<div class="flex h-screen flex-col">
  <div class="my-2 flex w-full justify-between">
    <slot />
    {#if $title === undefined}
      <h3>Creating a new layer</h3>
    {:else}
      <h3>Editing layer {$title}</h3>
    {/if}
    {#if $currentlyMissing.length > 0}
      <div class="w-16" />
      <!-- Empty div, simply hide this -->
    {:else if $hasErrors > 0}
      <div class="alert">{$hasErrors} errors detected</div>
    {:else}
      <div class="flex">
        <a
          class="button small"
          href={baseUrl + state.server.layerUrl(title.data) + "&test=true"}
          target="_blank"
          rel="noopener"
        >
          <div class="flex flex-col">
            <b>Test in safe mode</b>
            <div>No changes are recoded to OSM</div>
          </div>
          <ChevronRightIcon class="h-6 w-6 shrink-0" />
        </a>
        <a
          class="primary button"
          href={baseUrl + state.server.layerUrl(title.data)}
          target="_blank"
          rel="noopener"
        >
          Try it out
          <ChevronRightIcon class="h-6 w-6 shrink-0" />
        </a>
      </div>
    {/if}
  </div>

  {#if $currentlyMissing.length > 0}
    {#each requiredFields as required}
      <SchemaBasedInput {state} schema={configForRequiredField(required)} path={[required]} />
    {/each}
  {:else}
    <div class="m4 h-full overflow-y-auto">
      <TabbedGroup bind:this={tabbedGroup}>
        <div slot="title0" class="flex">
          General properties
          <ErrorIndicatorForRegion firstPaths={firstPathsFor("Basic")} {state} />
        </div>
        <div class="flex flex-col" slot="content0">
          <Region {state} configs={perRegion["Basic"]} />
          <div class="mt-12">
            <button on:click={() => deleteLayer()} class="small">
              <TrashIcon class="h-6 w-6" />
              Delete this layer
            </button>
          </div>
        </div>

        <div slot="title1" class="flex">
          Information panel (questions and answers)
          <ErrorIndicatorForRegion
            firstPaths={firstPathsFor("title", "tagrenderings", "editing")}
            {state}
          />
        </div>
        <div slot="content1">
          <QuestionPreview path={["title"]} {state} schema={perRegion["title"][0]} />
          <Region configs={perRegion["tagrenderings"]} {state} title="Popup contents" />
          <Region configs={perRegion["editing"]} {state} title="Other editing elements" />
        </div>

        <div slot="title2">
          Creating a new point
          <ErrorIndicatorForRegion firstPaths={firstPathsFor("presets")} {state} />
        </div>

        <div slot="content2">
          <Region {state} configs={perRegion["presets"]} />
        </div>

        <div slot="title3" class="flex">
          Rendering on the map
          <ErrorIndicatorForRegion
            firstPaths={firstPathsFor("linerendering", "pointrendering")}
            {state}
          />
        </div>
        <div slot="content3">
          <Region configs={perRegion["linerendering"]} {state} />
          <Region configs={perRegion["pointrendering"]} {state} />
        </div>

        <div slot="title4" class="flex">
          Advanced functionality
          <ErrorIndicatorForRegion firstPaths={firstPathsFor("advanced")} {state} />
        </div>
        <div slot="content4">
          <Region configs={perRegion["advanced"]} {state} />
          <Region configs={perRegion["expert"]} {state} />
        </div>
        <div slot="title5">Configuration file</div>
        <div slot="content5">
          <div>
            Below, you'll find the raw configuration file in `.json`-format. This is mostly for
            debugging purposes, but you can also edit the file directly if you want.
          </div>
          <div class="literal-code h-64 w-full" bind:this={editorContainer} />

          <ShowConversionMessages messages={$messages} />
          <div>
            The testobject (which is used to render the questions in the 'information panel' item
            has the following tags:
          </div>

          <AllTagsPanel tags={state.testTags} />
        </div>
      </TabbedGroup>
    </div>
    {#if $highlightedItem !== undefined}
      <FloatOver on:close={() => highlightedItem.setData(undefined)}>
        <div>
          <TagRenderingInput path={$highlightedItem.path} {state} />
          <!-- 
            schema={$highlightedItem.schema} -->
        </div>
      </FloatOver>
    {/if}
  {/if}
</div>
