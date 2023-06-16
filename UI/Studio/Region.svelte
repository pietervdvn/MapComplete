<script lang="ts">/***
 * A 'region' is a collection of properties that can be edited which are somewhat related.
 * They will typically be a subset of some properties
 */
import SchemaBasedField from "./SchemaBasedField.svelte";
import type {ConfigMeta} from "./configMeta";
import EditLayerState from "./EditLayerState";

export let state : EditLayerState
export let configs: ConfigMeta[]
export let title: string

</script>

<h3>{title}</h3>
<div class="pl-2 border border-black flex flex-col gap-y-1">

    {#each configs as config}
        <SchemaBasedField {state} schema={config} title={config.path.at(-1)}></SchemaBasedField>
    {/each}
</div>
