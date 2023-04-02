<script lang="ts">
  import { UIEventSource } from "../../../Logic/UIEventSource";
  import type { SpecialVisualizationState } from "../../SpecialVisualization";
  import Tr from "../../Base/Tr.svelte";
  import If from "../../Base/If.svelte";
  import TagRenderingMapping from "./TagRenderingMapping.svelte";
  import type { Feature } from "geojson";
  import type { Mapping } from "../../../Models/ThemeConfig/TagRenderingConfig";
  import TagRenderingConfig from "../../../Models/ThemeConfig/TagRenderingConfig";
  import { TagsFilter } from "../../../Logic/Tags/TagsFilter";
  import FreeformInput from "./FreeformInput.svelte";
  import Translations from "../../i18n/Translations.js";
  import FromHtml from "../../Base/FromHtml.svelte";
  import ChangeTagAction from "../../../Logic/Osm/Actions/ChangeTagAction";
  import { createEventDispatcher } from "svelte";
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";
  import { ExclamationIcon } from "@rgossiaux/svelte-heroicons/solid";
  import SpecialTranslation from "./SpecialTranslation.svelte";

  export let config: TagRenderingConfig;
  export let tags: UIEventSource<Record<string, string>>;
  export let selectedElement: Feature;
  export let state: SpecialVisualizationState;
  export let layer: LayerConfig;

  // Will be bound if a freeform is available
  let freeformInput = new UIEventSource<string>(undefined);
  let selectedMapping: number = undefined;
  let checkedMappings: boolean[];
  $: {

    if (config.mappings?.length > 0) {
      checkedMappings = [...config.mappings.map(_ => false), false /*One element extra in case a freeform value is added*/];
    }
  }
  let selectedTags: TagsFilter = undefined;
  $: {
    try {

      selectedTags = config?.constructChangeSpecification($freeformInput, selectedMapping, checkedMappings);
    } catch (e) {
      console.debug("Could not calculate changeSpecification:", e);
      selectedTags = undefined;
    }
  }

  function mappingIsHidden(mapping: Mapping): boolean {
    if (mapping.hideInAnswer === undefined || mapping.hideInAnswer === false) {
      return false;
    }
    if (mapping.hideInAnswer === true) {
      return true;
    }
    return (<TagsFilter>mapping.hideInAnswer).matchesProperties(tags.data);
  }

  let dispatch = createEventDispatcher<{
    "saved": {
      config: TagRenderingConfig,
      applied: TagsFilter
    }
  }>();

  function onSave() {
    dispatch("saved", { config, applied: selectedTags });
    const change = new ChangeTagAction(
      tags.data.id,
      selectedTags,
      tags.data,
      {
        theme: state.layout.id,
        changeType: "answer"
      }
    );
    freeformInput.setData(undefined);
    selectedMapping = 0;
    selectedTags = undefined;
    change.CreateChangeDescriptions().then(changes =>
      state.changes.applyChanges(changes)
    ).catch(console.error);
  }


</script>

{#if config.question !== undefined}
  <div class="border border-black subtle-background flex flex-col">
    <If condition={state.featureSwitchIsTesting}>
      <div class="flex justify-between">
        <SpecialTranslation t={config.question} {tags} {state} {layer} feature={selectedElement}></SpecialTranslation>
        <span class="alert">{config.id}</span>
      </div>
      <SpecialTranslation slot="else" t={config.question} {tags} {state} {layer} feature={selectedElement}></SpecialTranslation>
    </If>

    {#if config.questionhint}
      <div class="subtle">
        <SpecialTranslation t={config.questionhint} {tags} {state} {layer} feature={selectedElement}></SpecialTranslation>
      </div>
    {/if}

    {#if config.freeform?.key && !(config.mappings?.length > 0)}
      <!-- There are no options to choose from, simply show the input element: fill out the text field -->
      <FreeformInput {config} {tags} value={freeformInput} />
    {/if}

    {#if config.mappings !== undefined && !config.multiAnswer}
      <!-- Simple radiobuttons as mapping -->
      <div class="flex flex-col">
        {#each config.mappings as mapping, i (mapping.then)}
          {#if !mappingIsHidden(mapping)  }
            <label>
              <input type="radio" bind:group={selectedMapping} name={"mappings-radio-"+config.id} value={i}>
              <TagRenderingMapping {mapping} {tags} {state} {selectedElement} {layer}></TagRenderingMapping>
            </label>
          {/if}
        {/each}
        {#if config.freeform?.key}
          <label>
            <input type="radio" bind:group={selectedMapping} name={"mappings-radio-"+config.id}
                   value={config.mappings.length}>
            <FreeformInput {config} {tags} value={freeformInput}
                           on:selected={() => selectedMapping = config.mappings.length } />
          </label>
        {/if}
      </div>
    {/if}


    {#if config.mappings !== undefined && config.multiAnswer}
      <!-- Multiple answers can be chosen: checkboxes -->
      <div class="flex flex-col">
        {#each config.mappings as mapping, i (mapping.then)}
          {#if !mappingIsHidden(mapping)  }
            <label>
              <input type="checkbox" name={"mappings-checkbox-"+config.id+"-"+i} bind:checked={checkedMappings[i]}>
              <TagRenderingMapping {mapping} {tags} {state} {selectedElement}></TagRenderingMapping>
            </label>
          {/if}
        {/each}
        {#if config.freeform?.key}
          <label>
            <input type="checkbox" name={"mappings-checkbox-"+config.id+"-"+config.mappings.length}
                   bind:checked={checkedMappings[config.mappings.length]}>
            <FreeformInput {config} {tags} value={freeformInput}
                           on:selected={() => checkedMappings[config.mappings.length] = true} />
          </label>
        {/if}
      </div>
    {/if}

    <FromHtml src={selectedTags?.asHumanString(true, true, {})} />

    <div>
      <!-- TagRenderingQuestion-buttons -->
      <slot name="cancel"></slot>
      {#if selectedTags !== undefined}
        <button on:click={onSave}>
          <Tr t={Translations.t.general.save}></Tr>
        </button>
      {:else }
        <div class="w-6 h-6">
          <!-- Invalid value; show an inactive button or something like that-->
        <ExclamationIcon></ExclamationIcon>
        </div>
      {/if}
    </div>

  </div>
{/if}
