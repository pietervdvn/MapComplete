<script lang="ts">/**
 * The FilterView shows the various options to enable/disable a single layer.
 */
import type FilteredLayer from "../../Models/FilteredLayer";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import ToSvelte from "../Base/ToSvelte.svelte";
import Checkbox from "../Base/Checkbox.svelte";
import FilterConfig from "../../Models/ThemeConfig/FilterConfig";
import type { Writable } from "svelte/store";
import If from "../Base/If.svelte";
import Dropdown from "../Base/Dropdown.svelte";
import { onDestroy } from "svelte";

export let filteredLayer: FilteredLayer;
export let zoomlevel: number;
let layer: LayerConfig = filteredLayer.layerDef;
let isDisplayed: boolean = filteredLayer.isDisplayed.data;
onDestroy(filteredLayer.isDisplayed.addCallbackAndRunD(d => {
  isDisplayed = d;
  return false
}));

/**
 * Gets a UIEventSource as boolean for the given option, to be used with a checkbox
 */
function getBooleanStateFor(option: FilterConfig): Writable<boolean> {
  const state = filteredLayer.appliedFilters.get(option.id);
  return state.sync(f => f === 0, [], (b) => b ? 0 : undefined);
}

/**
 * Gets a UIEventSource as number for the given option, to be used with a dropdown or radiobutton
 */
function getStateFor(option: FilterConfig): Writable<number> {
  return filteredLayer.appliedFilters.get(option.id);
}
</script>
{#if filteredLayer.layerDef.name}
  <div>
    <label class="flex gap-1">
      <Checkbox selected={filteredLayer.isDisplayed} />
      <If condition={filteredLayer.isDisplayed}>
        <ToSvelte construct={() => layer.defaultIcon()?.SetClass("block h-6 w-6")}></ToSvelte>
        <ToSvelte slot="else" construct={() => layer.defaultIcon()?.SetClass("block h-6 w-6 opacity-50")}></ToSvelte>
      </If>

      {filteredLayer.layerDef.name}
    </label>
    <If condition={filteredLayer.isDisplayed}>
      <div id="subfilters" class="flex flex-col gap-y-1 mb-4 ml-4">
        {#each filteredLayer.layerDef.filters as filter}
          <div>

            <!-- There are three (and a half) modes of filters: a single checkbox, a radio button/dropdown or with fields -->
            {#if filter.options.length === 1 && filter.options[0].fields.length === 0}
              <label>
                <Checkbox selected={getBooleanStateFor(filter)} />
                {filter.options[0].question}
              </label>
            {/if}

            {#if filter.options.length > 1}
              <Dropdown value={getStateFor(filter)}>
                {#each filter.options as option, i}
                  <option value={i}>
                    { option.question}
                  </option>
                {/each}
              </Dropdown>
            {/if}


          </div>
        {/each}
      </div>
    </If>

  </div>
{/if}
