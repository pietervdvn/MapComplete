<script lang="ts">
  import TagRenderingConfig from "../../../Models/ThemeConfig/TagRenderingConfig";
  import { Utils } from "../../../Utils";
  import { Translation } from "../../i18n/Translation";
  import TagRenderingMapping from "./TagRenderingMapping.svelte";
  import type { SpecialVisualizationState } from "../../SpecialVisualization";
  import type { Feature } from "geojson";
  import { UIEventSource } from "../../../Logic/UIEventSource";
  import { onDestroy } from "svelte";
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";

  export let tags: UIEventSource<Record<string, string> | undefined>;
  let _tags: Record<string, string>;
  onDestroy(tags.addCallbackAndRun(tags => {
    _tags = tags;
  }));
  export let state: SpecialVisualizationState;
  export let selectedElement: Feature;
  export let config: TagRenderingConfig;
  export let layer: LayerConfig
  let trs: { then: Translation; icon?: string; iconClass?: string }[];
  $: trs = Utils.NoNull(config?.GetRenderValues(_tags));
</script>

{#if config !== undefined && (config?.condition === undefined || config.condition.matchesProperties(_tags))}
  {#if trs.length === 1}
    <TagRenderingMapping mapping={trs[0]} {tags} {state} {selectedElement} {layer}></TagRenderingMapping>
  {/if}
  {#if trs.length > 1}
    <ul>
      {#each trs as mapping}
        <li>
          <TagRenderingMapping {mapping} {tags} {state} {selectedElement} {layer}></TagRenderingMapping>
        </li>
      {/each}
    </ul>
  {/if}
{/if}
