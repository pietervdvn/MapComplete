<script lang="ts">
    import type {ConfigMeta} from "./configMeta";
    import SchemaBasedField from "./SchemaBasedField.svelte";
    import EditLayerState from "./EditLayerState";
    import SchemaBasedArray from "./SchemaBasedArray.svelte";
    import SchemaBaseMultiType from "./SchemaBaseMultiType.svelte";

    export let schema: ConfigMeta
    export let state: EditLayerState
    export let path: (string | number)[] = []

</script>

{#if schema.type === "array"}
    <SchemaBasedArray {path} {state} {schema}/>
{:else if schema.hints.types}
    <SchemaBaseMultiType {path} {state} {schema}></SchemaBaseMultiType>
{:else}
    <SchemaBasedField {path} {state} {schema}/>
{/if}
