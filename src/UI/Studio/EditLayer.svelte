<script lang="ts">

  import EditLayerState, { LayerStateSender } from "./EditLayerState";
  import layerSchemaRaw from "../../assets/schemas/layerconfigmeta.json";
  import Region from "./Region.svelte";
  import TabbedGroup from "../Base/TabbedGroup.svelte";
  import { Store, UIEventSource } from "../../Logic/UIEventSource";
  import type { ConfigMeta } from "./configMeta";
  import { Utils } from "../../Utils";

  const layerSchema: ConfigMeta[] = <any>layerSchemaRaw;
  let state = new EditLayerState(layerSchema);
  state.configuration.setData({});
  const configuration = state.configuration;
  new LayerStateSender("http://localhost:1235", state);
  /**
   * Blacklist of regions for the general area tab
   * These are regions which are handled by a different tab
   */
  const regionBlacklist = ["hidden", undefined, "infobox", "tagrenderings", "maprendering", "editing", "title"];
  const allNames = Utils.Dedup(layerSchema.map(meta => meta.hints.group));

  const perRegion: Record<string, ConfigMeta[]> = {};
  for (const region of allNames) {
    perRegion[region] = layerSchema.filter(meta => meta.hints.group === region);
  }

  const baselayerRegions: string[] = ["Basic", "presets", "filters", "advanced", "expert"];
  for (const baselayerRegion of baselayerRegions) {
    if (perRegion[baselayerRegion] === undefined) {
      console.error("BaseLayerRegions in editLayer: no items have group '" + baselayerRegion + "\"");
    }
  }
  const leftoverRegions: string[] = allNames.filter(r => regionBlacklist.indexOf(r) < 0 && baselayerRegions.indexOf(r) < 0);
  const title: Store<string> = state.getStoreFor(["id"]);
</script>

<h3>Editing layer {$title}</h3>
<h4>Leftover regions</h4>
{leftoverRegions.join("; ")}
<div class="m4">
  <TabbedGroup tab={new UIEventSource(2)}>
    <div slot="title0">General properties</div>
    <div class="flex flex-col" slot="content0">
      {#each baselayerRegions as region}
        <Region {state} configs={perRegion[region]} title={region} />
      {/each}
      {#each leftoverRegions as region}
        <Region {state} configs={perRegion[region]} title={region} />
      {/each}
    </div>
    <div slot="title1">Information panel (questions and answers)</div>
    <div slot="content1">
      <Region configs={perRegion["title"]} {state} title="Popup title" />
      <Region configs={perRegion["tagrenderings"]} {state} title="Popup contents"/>
      <Region configs={perRegion["editing"]} {state} title="Other editing elements" />
    </div>

    <div slot="title2">Rendering on the map</div>
    <div slot="content2">
      <Region configs={perRegion["linerendering"]} {state} />
      <Region configs={perRegion["pointrendering"]} {state} />
    </div>
    <div slot="title3">Configuration file</div>
    <div slot="content3">
      <div>
        Below, you'll find the raw configuration file in `.json`-format.
        This is mostly for debugging purposes
      </div>
      <div class="literal-code">
        {JSON.stringify($configuration, null, "  ")}
      </div>
    </div>
  </TabbedGroup>

</div>
