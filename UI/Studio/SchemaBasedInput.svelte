<script lang="ts">
    import type {ConfigMeta} from "./configMeta";
    import SchemaBasedField from "./SchemaBasedField.svelte";
    import EditLayerState from "./EditLayerState";
    import SchemaBasedArray from "./SchemaBasedArray.svelte";
    import SchemaBaseMultiType from "./SchemaBaseMultiType.svelte";
    import RegisteredTagInput from "./RegisteredTagInput.svelte";

    export let schema: ConfigMeta
    export let state: EditLayerState
    export let path: (string | number)[] = []


</script>

{#if schema.type === "array"}
    <SchemaBasedArray {path} {state} {schema}/>
{:else if schema.hints.typehint === "tag"}
    <RegisteredTagInput {state} {path} {schema}/>
{:else if schema.hints.types}
    <SchemaBaseMultiType {path} {state} {schema}/>
{:else}
    <SchemaBasedField {path} {state} {schema}/>
{/if}
