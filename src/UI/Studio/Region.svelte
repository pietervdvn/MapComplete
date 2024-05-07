<script lang="ts">
  /***
   * A 'region' is a collection of properties that can be edited which are somewhat related.
   * They will typically be a subset of some properties
   */
  import type { ConfigMeta } from "./configMeta"
  import EditLayerState from "./EditLayerState"
  import SchemaBasedInput from "./SchemaBasedInput.svelte"

  export let state: EditLayerState
  export let configs: ConfigMeta[]
  export let title: string | undefined = undefined

  export let path: readonly (string | number)[] = []

  let expertMode = state.expertMode
  let configsNoHidden = configs.filter((schema) => schema.hints?.group !== "hidden")
  let configsFiltered = $expertMode
    ? configsNoHidden
    : configsNoHidden.filter((schema) => schema.hints?.group !== "expert")
</script>

{#if configs === undefined}
  Bug: 'Region' received 'undefined' at {path.join(".")}
{:else if configs.length === 0}
  Bug: Region received empty list as configuration at {path.join(".")}
{:else if title}
  <div class="flex w-full flex-col">
    <h3>{title}</h3>
    <div class="flex w-full flex-col gap-y-1 border border-black pl-2">
      <slot name="description" />
      {#each configsFiltered as config}
        <SchemaBasedInput {state} path={config.path} schema={config} />
      {/each}
    </div>
  </div>
{:else}
  <div class="flex w-full flex-col gap-y-1 pl-2">
    {#each configsFiltered as config}
      <SchemaBasedInput {state} path={path.concat(config.path)} schema={config} />
    {/each}
  </div>
{/if}
