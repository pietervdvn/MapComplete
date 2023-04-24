<script lang="ts">
  import FilteredLayer from "../../Models/FilteredLayer";
  import type { FilterConfigOption } from "../../Models/ThemeConfig/FilterConfig";
  import Locale from "../i18n/Locale";
  import ValidatedInput from "../InputElement/ValidatedInput.svelte";
  import { UIEventSource } from "../../Logic/UIEventSource";
  import { onDestroy } from "svelte";

  export let filteredLayer: FilteredLayer;
  export let option: FilterConfigOption;
  export let id: string;
  let parts: string[];
  let language = Locale.language;
  $: {
    parts = option.question.textFor($language).split("{");
  }
  let fieldValues: Record<string, UIEventSource<string>> = {};
  let fieldTypes: Record<string, string> = {};
  let appliedFilter = <UIEventSource<string>>filteredLayer.appliedFilters.get(id);
  let initialState: Record<string, string> = JSON.parse(appliedFilter?.data ?? "{}");

  function setFields() {
    const properties: Record<string, string> = {};
    for (const key in fieldValues) {
      const v = fieldValues[key].data;
      const k = key.substring(0, key.length - 1);
      if (v === undefined) {
        properties[k] = undefined;
      } else {
        properties[k] = v;
      }
    }
    appliedFilter?.setData(FilteredLayer.fieldsToString(properties));
  }

  for (const field of option.fields) {
    // A bit of cheating: the 'parts' will have '}' suffixed for fields
    fieldTypes[field.name + "}"] = field.type;
    const src = new UIEventSource<string>(initialState[field.name] ?? "");
    fieldValues[field.name + "}"] = src;
    onDestroy(src.stabilized(200).addCallback(() => {
      setFields();
    }));
  }

</script>

<div>
  {#each parts as part, i}
    {#if part.endsWith("}")}
      <!-- This is a field! -->
      <ValidatedInput value={fieldValues[part]} type={fieldTypes[part]} />
    {:else}
      {part}
    {/if}
  {/each}
</div>
