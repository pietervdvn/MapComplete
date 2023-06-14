<script lang="ts">
  import { createEventDispatcher } from "svelte"

  /**
   * A round button with an icon and possible a small text, which hovers above the map
   */
  const dispatch = createEventDispatcher()
  export let cls = ""
</script>

<button
  on:click={(e) => dispatch("click", e)}
  class={"pointer-events-auto m-0.5 h-fit w-fit rounded-full p-0.5 sm:p-1 md:m-1 " + cls}
>
  <slot />
</button>
