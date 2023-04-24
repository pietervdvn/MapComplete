<script lang="ts">
  import { createEventDispatcher } from "svelte";

  /**
   * A round button with an icon and possible a small text, which hovers above the map
   */
   const dispatch = createEventDispatcher()
</script>


<div on:click={e => dispatch("click", e)} class="subtle-background rounded-full h-fit w-fit m-0.5 md:m-1 p-0.5 sm:p-1 cursor-pointer">
  <slot/>
</div>
