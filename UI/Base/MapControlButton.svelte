<script lang="ts">
  import { createEventDispatcher } from "svelte";

  /**
   * A round button with an icon and possible a small text, which hovers above the map
   */
   const dispatch = createEventDispatcher()
  export let cls = ""
</script>


<button on:click={e => dispatch("click", e)} class={"rounded-full h-fit w-fit m-0.5 md:m-1 p-0.5 sm:p-1 pointer-events-auto "+cls} >
  <slot/>
</button>
