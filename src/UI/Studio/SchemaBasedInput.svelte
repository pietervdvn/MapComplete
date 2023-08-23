<script lang="ts">
  import type { ConfigMeta } from "./configMeta";
  import SchemaBasedField from "./SchemaBasedField.svelte";
  import EditLayerState from "./EditLayerState";
  import SchemaBasedArray from "./SchemaBasedArray.svelte";
  import SchemaBasedMultiType from "./SchemaBasedMultiType.svelte";
  import SchemaBasedTranslationInput from "./SchemaBasedTranslationInput.svelte";

  export let schema: ConfigMeta;
  export let state: EditLayerState;
  export let path: (string | number)[] = [];
  
</script>
{#if schema.hints.typehint === "tagrendering[]"}
  <!-- We cheat a bit here by matching this 'magical' type... -->
  <SchemaBasedArray {path} {state} {schema} />
{:else if schema.type === "array"}
  <SchemaBasedArray {path} {state} {schema} />
{:else if schema.type === "translation"}
  <SchemaBasedTranslationInput {path} {state} {schema} />
{:else if schema.hints.types}
  <SchemaBasedMultiType {path} {state} {schema} />
{:else}
  <SchemaBasedField {path} {state} {schema} />
{/if}
