<script lang="ts">
  import { Store } from "../../Logic/UIEventSource"
  import { onDestroy } from "svelte"

  /**
   * For some stupid reason, it is very hard to let {#if} work together with UIEventSources, so we wrap then here
   */
  export let condition: Store<boolean>
  let _c = condition.data
  onDestroy(
    condition.addCallback((c) => {
      /* Do _not_ abbreviate this as `.addCallback(c => _c = c)`. This is the same as writing `.addCallback(c => {return _c = c})`, 
    which will _unregister_ the callback if `c = true`! */
      _c = c
      return false
    })
  )
</script>

{#if _c}
  <slot />
{:else}
  <slot name="else" />
{/if}
