<script lang="ts">
    import type {ConfigMeta} from "./configMeta";
    import SchemaBasedField from "./SchemaBasedField.svelte";
    import EditLayerState from "./EditLayerState";
    import SchemaBasedArray from "./SchemaBasedArray.svelte";

    export let schema: ConfigMeta
    export let state: EditLayerState
    export let path : (string | number)[] = []

</script>

<span class="subtle">{path.join(".")}</span>
{#if schema.type === "array"}
    <SchemaBasedArray {path} {state} {schema}/>
{:else}
    <SchemaBasedField {path} {state} {schema}/>
{/if}
