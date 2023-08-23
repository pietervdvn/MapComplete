<script lang="ts">/***
 * A 'region' is a collection of properties that can be edited which are somewhat related.
 * They will typically be a subset of some properties
 */
import type { ConfigMeta } from "./configMeta";
import EditLayerState from "./EditLayerState";
import SchemaBasedInput from "./SchemaBasedInput.svelte";

export let state: EditLayerState;
export let configs: ConfigMeta[];
export let title: string | undefined = undefined;

export let path: (string | number)[] = [];

</script>
{#if title}
  <div class="w-full flex flex-col">
    <h3>{title}</h3>
    <div class="pl-2 border border-black flex flex-col gap-y-1 w-full">
      <slot name="description" />
      {#each configs as config}
        <SchemaBasedInput {state} path={config.path} schema={config} />
      {/each}
    </div>
  </div>
{:else}
  <div class="pl-2 flex flex-col gap-y-1 w-full">
    {#each configs as config}
      <SchemaBasedInput {state} path={path.concat(config.path)} schema={config} />
    {/each}
  </div>
{/if}

