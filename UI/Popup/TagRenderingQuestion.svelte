<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource";
  import type { SpecialVisualizationState } from "../SpecialVisualization";
  import Tr from "../Base/Tr.svelte";
  import If from "../Base/If.svelte";
  import ValidatedInput from "../InputElement/ValidatedInput.svelte";
  import TagRenderingMapping from "./TagRenderingMapping.svelte";
  import type { Feature } from "geojson";
  import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";

  export let config: TagRenderingConfig;
  export let tags: UIEventSource<Record<string, string>>;
  export let selectedElement: Feature;

  export let state: SpecialVisualizationState;
  state.featureSwitchIsTesting;

  let freeformInput = new UIEventSource<string>(undefined);
</script>

{#if config.question !== undefined}
  <div class="border border-black subtle-background">
    <If condition={state.featureSwitchIsTesting}>
      <div class="flex justify-between">
        <Tr t={config.question}></Tr>
        {config.id}
      </div>
      <Tr slot="else" t={config.question}></Tr>
    </If>

    {#if config.questionhint}
      <div class="subtle">
        <Tr t={config.question}></Tr>
      </div>
    {/if}

    {#if config.freeform?.key && !(config.mappings?.length > 0)}
      <!-- There are no options to choose from, simply show the input element: fill out the text field -->
      <ValidatedInput type={config.freeform.type} value={freeformInput}></ValidatedInput>
    {/if}

    {#if config.mappings !== undefined}
      <div class="flex flex-col">
        {#each config.mappings as mapping}
          {#if mapping.hideInAnswer === true || !(mapping.hideInAnswer) || (console.log(tags) || true) || !(mapping.hideInAnswer?.matchesProperties($tags))  }
            <TagRenderingMapping {mapping} {tags} {state} {selectedElement}></TagRenderingMapping>
          {/if}
        {/each}
      </div>
    {/if}

  </div>
{/if}
