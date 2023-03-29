<script lang="ts">
  import { Translation } from "../i18n/Translation";
  import SpecialTranslation from "./SpecialTranslation.svelte";
  import type { SpecialVisualizationState } from "../SpecialVisualization";
  import type { Feature } from "geojson";
  import { UIEventSource } from "../../Logic/UIEventSource";

  export let selectedElement: Feature
  export let tags: UIEventSource<Record<string, string>>;
  export let state: SpecialVisualizationState
  export let mapping: {
    then: Translation; icon?: string; iconClass?: | "small"
      | "medium"
      | "large"
      | "small-height"
      | "medium-height"
      | "large-height"
  };
  let iconclass = "mapping-icon-" + mapping.iconClass;


</script>

{#if mapping.icon !== undefined}
  <div class="flex">
    <img class={iconclass+" mr-1"} src={mapping.icon}>
    <SpecialTranslation t={mapping.then} {tags} {state} feature={selectedElement}></SpecialTranslation>
  </div>
{:else if mapping.then !== undefined}
  <SpecialTranslation t={mapping.then} {tags} {state} feature={selectedElement}></SpecialTranslation>
{/if}

