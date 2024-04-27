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
  import AllTagsPanel from "../Popup/AllTagsPanel.svelte"
  import QuestionPreview from "./QuestionPreview.svelte"
  import ShowConversionMessages from "./ShowConversionMessages.svelte"
  import RawEditor from "./RawEditor.svelte"
  import NextButton from "../Base/NextButton.svelte"
  import BackButton from "../Base/BackButton.svelte"
  import DeleteButton from "./DeleteButton.svelte"
  import StudioHashSetter from "./StudioHashSetter"

  const layerSchema: ConfigMeta[] = <any>layerSchemaRaw

  export let state: EditLayerState

  export let backToStudio: () => void

  new StudioHashSetter("layer", state.selectedTab, state.getStoreFor(["id"]))

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
  let currentlyMissing = configuration.map((config) => {
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
      <TabbedGroup tab={state.selectedTab}>
        <div slot="title0" class="flex">
          General properties
          <ErrorIndicatorForRegion firstPaths={firstPathsFor("Basic")} {state} />
        </div>
        <div class="flex flex-col mb-8" slot="content0">
          <Region {state} configs={perRegion["Basic"]} />
          <DeleteButton {state} {backToStudio} objectType="layer" />
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
        <div slot="content5" class="flex h-full flex-col">
          <div>
            Below, you'll find the raw configuration file in `.json`-format. This is mostly for
            debugging purposes, but you can also edit the file directly if you want.
          </div>
          <div class="literal-code overflow-y-auto h-full" style="min-height: 75%">
            <RawEditor {state} />
          </div>
          <ShowConversionMessages messages={$messages} />

          <div class="flex w-full flex-col">
            <div>
              The testobject (which is used to render the questions in the 'information panel'
              item has the following tags:
            </div>

            <AllTagsPanel tags={state.testTags} />
          </div>
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
