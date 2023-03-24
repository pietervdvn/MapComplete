<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource";

  /**
   * For some stupid reason, it is very hard to let {#if} work together with UIEventSources, so we wrap then here
   */
  export let condition: UIEventSource<boolean>;
  let _c = condition.data;
  condition.addCallback(c => _c = c)
</script>

{#if _c}
  <slot></slot>
{/if}
