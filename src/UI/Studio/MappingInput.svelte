<script lang="ts">

  import type { MappingConfigJson } from "../../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson";
  import EditLayerState from "./EditLayerState";
  import { Translation } from "../i18n/Translation";
  import { UIEventSource } from "../../Logic/UIEventSource";
  import type { TagConfigJson } from "../../Models/ThemeConfig/Json/TagConfigJson";
  import { TagUtils } from "../../Logic/Tags/TagUtils";
  import FromHtml from "../Base/FromHtml.svelte";
  import { PencilIcon } from "@rgossiaux/svelte-heroicons/outline";
  import Region from "./Region.svelte";
  import type { ConfigMeta } from "./configMeta";
  import configs from "../../assets/schemas/questionabletagrenderingconfigmeta.json";
  import { Utils } from "../../Utils";

  export let state: EditLayerState;
  export let path: (string | number)[];
  let tag: UIEventSource<TagConfigJson> = state.getStoreFor([...path, "if"]);
  let parsedTag = tag.map(t => t ? TagUtils.Tag(t) : undefined);
  let exampleTags = parsedTag.map(pt => {
    if (!pt) {
      return {};
    }
    const keys = pt.usedKeys();
    const o = {};
    for (const key of keys) {
      o[key] = "value";
    }
    return o;
  });
  let uploadableOnly: boolean = true;

  let thenStringified = state.getStoreFor([...path, "then"]).sync(t => t ? JSON.stringify(t) : undefined, [], s => s ? JSON.parse(s) : undefined);
  let thenParsed = thenStringified.map(s => s ? JSON.parse(s) : s);
  let editMode = Object.keys(thenParsed.data).length === 0;

  const mappingConfigs: ConfigMeta[] = configs.filter(c => c.path[0] === "mappings")
    .map(c => <ConfigMeta>Utils.Clone(c))
    .map(c => {
      c.path.splice(0, 1);
      return c;
    })
    .filter(c => c.path.length == 1 && c.hints.group !== "hidden");
</script>

<button on:click={() => {editMode = !editMode}}>
  <PencilIcon class="w-6 h-6" />
</button>

{#if editMode}
  <div class="flex justify-between items-start w-full">
    <div class="flex flex-col w-full">
      <Region {state} configs={mappingConfigs} path={path} />
    </div>

    <slot name="delete" />
  </div>
{:else}
  <div>
    {#if Object.keys($thenParsed).length > 0}
      <b>
        {new Translation($thenParsed).txt}
      </b>
    {:else}
      <i>No then is set</i>
    {/if}
    <FromHtml src={ $parsedTag?.asHumanString(false, false, $exampleTags)} />
  </div>
{/if}

