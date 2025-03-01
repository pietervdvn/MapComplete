<script lang="ts">
  /***
   * A 'region' is a collection of properties that can be edited which are somewhat related.
   * They will typically be a subset of some properties
   */
  import type { ConfigMeta } from "./configMeta"
  import EditLayerState, { EditJsonState } from "./EditLayerState"
  import SchemaBasedInput from "./SchemaBasedInput.svelte"
  import AccordionSingle from "../Flowbite/AccordionSingle.svelte"
  import { Utils } from "../../Utils"

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
  <AccordionSingle>
    <div slot="header">{title}</div>
    <div class="flex w-full flex-col gap-y-1 pl-2">
      <slot name="description" />
      {#each configsFiltered as config (config.path)}
        <SchemaBasedInput {state} path={config.path} } />
      {/each}
    </div>
  </AccordionSingle>
{:else}
  <div class="flex w-full flex-col gap-y-1 pl-2">
    {#each configsFiltered as config}
      <SchemaBasedInput {state} path={path.concat(config.path)} schema={config} />
    {/each}
  </div>
{/if}
