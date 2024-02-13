<script lang="ts">
  import { EditThemeState } from "./EditLayerState"
  import type { ConfigMeta } from "./configMeta"
  import { ChevronRightIcon } from "@rgossiaux/svelte-heroicons/solid"
  import type { ConversionMessage } from "../../Models/ThemeConfig/Conversion/Conversion"
  import TabbedGroup from "../Base/TabbedGroup.svelte"
  import ShowConversionMessages from "./ShowConversionMessages.svelte"
  import Region from "./Region.svelte"
  import RawEditor from "./RawEditor.svelte"

  export let state: EditThemeState
  let schema: ConfigMeta[] = state.schema.filter((schema) => schema.path.length > 0)
  let config = state.configuration
  let messages = state.messages
  let hasErrors = messages.map(
    (m: ConversionMessage[]) => m.filter((m) => m.level === "error").length
  )
  let title = state.getStoreFor(["id"])
  const wl = window.location
  const baseUrl = wl.protocol + "//" + wl.host + "/theme.html?userlayout="

  const perRegion: Record<string, ConfigMeta[]> = {}
  for (const schemaElement of schema) {
    if (schemaElement.path.length > 1 && schemaElement.path[0] === "layers") {
      continue
    }
    const key = schemaElement.hints.group ?? "no-group"
    const list = perRegion[key] ?? (perRegion[key] = [])
    list.push(schemaElement)
  }
  console.log({ perRegion, schema })
</script>

<div class="flex h-screen flex-col">
  <div class="my-2 flex w-full justify-between">
    <slot />
    <h3>Editing theme {$title}</h3>
    {#if $hasErrors > 0}
      <div class="alert">{$hasErrors} errors detected</div>
    {:else}
      <a
        class="primary button"
        href={baseUrl + state.server.urlFor($title, "themes")}
        target="_blank"
        rel="noopener"
      >
        Try it out
        <ChevronRightIcon class="h-6 w-6 shrink-0" />
      </a>
    {/if}
  </div>

  <div class="m4 h-full overflow-y-auto">
    {Object.keys(perRegion).join(";")}
    <TabbedGroup>
      <div slot="title0">Basic properties</div>
      <div slot="content0">
        <Region configs={perRegion["basic"]} path={[]} {state} title="Basic properties" />
        <Region configs={perRegion["start_location"]} path={[]} {state} title="Start location" />
      </div>

      <div slot="title1">Layers</div>
      <div slot="content1">
        <Region configs={perRegion["layers"]} path={[]} {state} />
      </div>
      <div slot="title2">Feature switches</div>
      <div slot="content2">
        <Region configs={perRegion["feature_switches"]} path={[]} {state} />
      </div>

      <div slot="title3">Advanced options</div>
      <div slot="content3">
        <Region configs={perRegion["advanced"]} path={[]} {state} />
      </div>

      <div slot="title4">Configuration file</div>
      <div slot="content4" class="h-full">
        <div>
          Below, you'll find the raw configuration file in `.json`-format. This is mostly for
          debugging purposes, but you can also edit the file directly if you want.
        </div>
        <div class="literal-code h-full w-full">
          <RawEditor {state} />
        </div>

        <ShowConversionMessages messages={$messages} />
      </div>
    </TabbedGroup>
  </div>
</div>
