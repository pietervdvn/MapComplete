<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import { onDestroy } from "svelte"

  /**
   * Functions as 'If', but uses 'display:hidden' instead.
   */
  export let condition: UIEventSource<boolean>
  let _c = condition.data
  let hasBeenShownPositive = false
  let hasBeenShownNegative = false
  onDestroy(
    condition.addCallbackAndRun((c) => {
      /* Do _not_ abbreviate this as `.addCallback(c => _c = c)`. This is the same as writing `.addCallback(c => {return _c = c})`, 
        which will _unregister_ the callback if `c = true`! */
      hasBeenShownPositive = hasBeenShownPositive || c
      hasBeenShownNegative = hasBeenShownNegative || !c
      _c = c
      return false
    })
  )
</script>

{#if hasBeenShownPositive}
  <span class={_c ? "" : "hidden"}>
    <slot />
  </span>
{/if}

{#if hasBeenShownNegative}
  <span class={_c ? "hidden" : ""}>
    <slot name="else" />
  </span>
{/if}
