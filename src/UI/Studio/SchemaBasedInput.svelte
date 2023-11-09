<script lang="ts">
  import type { ConfigMeta } from "./configMeta"
  import SchemaBasedField from "./SchemaBasedField.svelte"
  import EditLayerState from "./EditLayerState"
  import SchemaBasedArray from "./SchemaBasedArray.svelte"
  import SchemaBasedMultiType from "./SchemaBasedMultiType.svelte"
  import ArrayMultiAnswer from "./ArrayMultiAnswer.svelte"

  export let schema: ConfigMeta
  export let state: EditLayerState
  export let path: (string | number)[] = []
  let expertMode = state.expertMode
</script>

{#if (schema.hints?.group !== "expert" || $expertMode) && schema.hints.group !== "hidden"}
  {#if schema.hints?.typehint?.endsWith("[]")}
    <!-- We cheat a bit here by matching this 'magical' type... -->
    <SchemaBasedArray {path} {state} {schema} />
  {:else if schema.type === "array" && schema.hints.multianswer === "true"}
    <ArrayMultiAnswer {path} {state} {schema} />
  {:else if schema.type === "array"}
    <SchemaBasedArray {path} {state} {schema} />
  {:else if schema.hints?.types}
    <SchemaBasedMultiType {path} {state} {schema} />
  {:else}
    <SchemaBasedField {path} {state} {schema} />
  {/if}
{:else if window.location.hostname === "127.0.0.1"}
  <div class="subtle">
    Not showing SBI {schema.path.join(".")} due to group {schema.hints.group}
  </div>
{/if}
