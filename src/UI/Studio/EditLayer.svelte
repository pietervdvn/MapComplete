<script lang="ts">
  import type { HighlightedTagRendering } from "./EditLayerState";
  import EditLayerState, { LayerStateSender } from "./EditLayerState";
  import layerSchemaRaw from "../../assets/schemas/layerconfigmeta.json";
  import Region from "./Region.svelte";
  import TabbedGroup from "../Base/TabbedGroup.svelte";
  import { Store, UIEventSource } from "../../Logic/UIEventSource";
  import type { ConfigMeta } from "./configMeta";
  import { Utils } from "../../Utils";
  import type { LayerConfigJson } from "../../Models/ThemeConfig/Json/LayerConfigJson";
  import type { ConversionMessage } from "../../Models/ThemeConfig/Conversion/Conversion";
  import ErrorIndicatorForRegion from "./ErrorIndicatorForRegion.svelte";
  import { ChevronRightIcon } from "@rgossiaux/svelte-heroicons/solid";
  import SchemaBasedInput from "./SchemaBasedInput.svelte";
  import FloatOver from "../Base/FloatOver.svelte";
  import TagRenderingInput from "./TagRenderingInput.svelte";
  import FromHtml from "../Base/FromHtml.svelte";
  import AllTagsPanel from "../Popup/AllTagsPanel.svelte";
  import QuestionPreview from "./QuestionPreview.svelte";

  const layerSchema: ConfigMeta[] = <any>layerSchemaRaw;

  export let state: EditLayerState;
  const messages = state.messages;
  const hasErrors = messages.map((m: ConversionMessage[]) => m.filter(m => m.level === "error").length);
  export let initialLayerConfig: Partial<LayerConfigJson> = {};
  state.configuration.setData(initialLayerConfig);
  const configuration = state.configuration;
  new LayerStateSender(state);
  /**
   * Blacklist of regions for the general area tab
   * These are regions which are handled by a different tab
   */
  const allNames = Utils.Dedup(layerSchema.map(meta => meta.hints.group));

  const perRegion: Record<string, ConfigMeta[]> = {};
  for (const region of allNames) {
    perRegion[region] = layerSchema.filter(meta => meta.hints.group === region);
  }


  const title: Store<string> = state.getStoreFor(["id"]);
  const wl = window.location;
  const baseUrl = wl.protocol + "//" + wl.host + "/theme.html?userlayout=";

  function firstPathsFor(...regionNames: string[]): Set<string> {
    const pathNames = new Set<string>();
    for (const regionName of regionNames) {
      const region: ConfigMeta[] = perRegion[regionName];
      for (const configMeta of region) {
        pathNames.add(configMeta.path[0]);
      }
    }
    return pathNames;

  }

  function configForRequiredField(id: string): ConfigMeta {
    let config = layerSchema.find(config => config.path.length === 1 && config.path[0] === id);
    config = Utils.Clone(config);
    config.required = true;
    console.log(">>>", config);
    config.hints.ifunset = undefined;
    return config;
  }

  let requiredFields = ["id", "name", "description"];
  let currentlyMissing = state.configuration.map(config => {
    const missing = [];
    for (const requiredField of requiredFields) {
      if (!config[requiredField]) {
        missing.push(requiredField);
      }
    }
    return missing;
  });

  let highlightedItem: UIEventSource<HighlightedTagRendering> = state.highlightedItem;
</script>

{#if $currentlyMissing.length > 0}

  {#each requiredFields as required}
    <SchemaBasedInput {state}
                      schema={configForRequiredField(required)}
                      path={[required]} />
  {/each}
{:else}
  <div class="h-screen flex flex-col">

    <div class="w-full flex justify-between my-2">
      <slot />
      <h3>Editing layer {$title}</h3>
      {#if $hasErrors > 0}
        <div class="alert">{$hasErrors} errors detected</div>
      {:else}
        <a class="primary button" href={baseUrl+state.server.layerUrl(title.data)} target="_blank" rel="noopener">
          Try it out
          <ChevronRightIcon class="h-6 w-6 shrink-0" />
        </a>
      {/if}
    </div>
    <div class="m4 h-full overflow-y-auto">
      <TabbedGroup>
        <div slot="title0" class="flex">General properties
          <ErrorIndicatorForRegion firstPaths={firstPathsFor("Basic")} {state} />
        </div>
        <div class="flex flex-col" slot="content0">
          <Region {state} configs={perRegion["Basic"]} />

        </div>


        <div slot="title1" class="flex">Information panel (questions and answers)
          <ErrorIndicatorForRegion firstPaths={firstPathsFor("title","tagrenderings","editing")} {state} />
        </div>
        <div slot="content1">
          <QuestionPreview path={["title"]} {state} schema={perRegion["title"][0]}></QuestionPreview>
          <Region configs={perRegion["tagrenderings"]} {state} title="Popup contents" />
          <Region configs={perRegion["editing"]} {state} title="Other editing elements" />
        </div>

        <div slot="title2">
          <ErrorIndicatorForRegion firstPaths={firstPathsFor("presets")} {state} />
          Creating a new point
        </div>

        <div slot="content2">
          <Region {state} configs={perRegion["presets"]} />
        </div>

        <div slot="title3" class="flex">Rendering on the map
          <ErrorIndicatorForRegion firstPaths={firstPathsFor("linerendering","pointrendering")} {state} />
        </div>
        <div slot="content3">
          <Region configs={perRegion["linerendering"]} {state} />
          <Region configs={perRegion["pointrendering"]} {state} />
        </div>

        <div slot="title4" class="flex">Advanced functionality
          <ErrorIndicatorForRegion firstPaths={firstPathsFor("advanced","expert")} {state} />
        </div>
        <div slot="content4">
          <Region configs={perRegion["advanced"]} {state} />
          <Region configs={perRegion["expert"]} {state} />
        </div>
        <div slot="title5">Configuration file</div>
        <div slot="content5">
          <div>
            Below, you'll find the raw configuration file in `.json`-format.
            This is mostly for debugging purposes
          </div>
          <div class="literal-code">
            <FromHtml src={JSON.stringify($configuration, null, "  ").replaceAll("\n","</br>")} />
          </div>
          {#each $messages as message}
            <li>
              {message.level}
              <span class="literal-code">{message.context.path.join(".")}</span>
              {message.message}
              <span class="literal-code">
                {message.context.operation.join(".")}
              </span>
            </li>
          {/each}

          The testobject (which is used to render the questions in the 'information panel' item has the following tags:
          
          <AllTagsPanel tags={state.testTags}></AllTagsPanel>
        </div>
      </TabbedGroup>
    </div>
  </div>
  {#if $highlightedItem !== undefined}
    <FloatOver on:close={() => highlightedItem.setData(undefined)}>
      <TagRenderingInput path={$highlightedItem.path} {state} schema={$highlightedItem.schema} />
    </FloatOver>
  {/if}

{/if}
