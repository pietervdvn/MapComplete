<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource";
  import { onDestroy } from "svelte";

  /**
   * For some stupid reason, it is very hard to let {#if} work together with UIEventSources, so we wrap then here
   */
  export let condition: UIEventSource<boolean>;
  let _c = !condition.data;
  onDestroy(condition.addCallback(c => {
    _c = !c;
    return false
  }))
</script>

{#if _c}
  <slot></slot>
{/if}
