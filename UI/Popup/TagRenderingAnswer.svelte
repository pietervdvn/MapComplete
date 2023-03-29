<script lang="ts">
  import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";
  import { Utils } from "../../Utils";
  import { Translation } from "../i18n/Translation";
  import TagRenderingMapping from "./TagRenderingMapping.svelte";
  import type { SpecialVisualizationState } from "../SpecialVisualization";
  import type { Feature } from "geojson";
  import { UIEventSource } from "../../Logic/UIEventSource";
  import { onDestroy } from "svelte";

  export let tags: UIEventSource<Record<string, string> | undefined>;
  let _tags : Record<string, string>
  onDestroy(tags.addCallbackAndRun(tags => {
    _tags = tags
  }))
  export let state: SpecialVisualizationState
  export let selectedElement: Feature
  export let config: TagRenderingConfig;
  let trs: { then: Translation; icon?: string; iconClass?: string }[];
  $: trs = Utils.NoNull(config?.GetRenderValues(_tags));
</script>

{#if config !== undefined && (config?.condition === undefined || config.condition.matchesProperties(tags))}
  <div>
    {#if trs.length === 1}
      <TagRenderingMapping mapping={trs[0]} {tags} {state} feature={selectedElement}></TagRenderingMapping>
    {/if}
    {#if trs.length > 1}
      {#each trs as mapping}
        <TagRenderingMapping mapping={trs} {tags} {state} feature=""{selectedElement}></TagRenderingMapping>
      {/each}
    {/if}
  </div>
{/if}
