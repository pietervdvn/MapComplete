<script lang="ts">
  import { EditThemeState } from "./EditLayerState";
  import type { ConfigMeta } from "./configMeta";
  import { ChevronRightIcon } from "@rgossiaux/svelte-heroicons/solid";
  import type { ConversionMessage } from "../../Models/ThemeConfig/Conversion/Conversion";
  import TabbedGroup from "../Base/TabbedGroup.svelte";
  import ShowConversionMessages from "./ShowConversionMessages.svelte";
  import Region from "./Region.svelte";

  export let state: EditThemeState;
  let schema: ConfigMeta[] = state.schema.filter(schema => schema.path.length > 0 && schema.path[0] !== "layers");
  let config = state.configuration;
  const messages = state.messages;
  const hasErrors = messages.map((m: ConversionMessage[]) => m.filter(m => m.level === "error").length);
  let title = state.getStoreFor(["id"]);
  const wl = window.location;
  const baseUrl = wl.protocol + "//" + wl.host + "/theme.html?userlayout=";

  const perRegion: Record<string, ConfigMeta[]> = {};
  for (const schemaElement of schema) {
    const key = schemaElement.hints.group ?? "no-group"
    const list = perRegion[key] ?? (perRegion[key] = [])
    list.push(schemaElement)
  }

</script>

<div class="w-full flex justify-between my-2">
  <slot />
  <h3>Editing theme {$title}</h3>
  {#if $hasErrors > 0}
    <div class="alert">{$hasErrors} errors detected</div>
  {:else}
    <a class="primary button" href={baseUrl+state.server.urlFor($title, "themes")} target="_blank" rel="noopener">
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
      <Region {state} configs={perRegion["basic"]} path={[]}></Region>
      <Region {state} configs={perRegion["no-group"]} path={[]}></Region>
    </div>
    <div slot="title1">Feature switches</div>
    <div slot="content1">
      <Region {state} configs={perRegion["feature_switches"]} path={[]}></Region>
    </div>
    <div slot="title2">Configuration file</div>
    <div slot="content2">
      <div class="literal-code">
        {JSON.stringify($config)}
      </div>

      <ShowConversionMessages messages={$messages}></ShowConversionMessages>

    </div>
  </TabbedGroup>
</div>

