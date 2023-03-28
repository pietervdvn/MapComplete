<script lang="ts">
  import { createEventDispatcher } from "svelte";

  /**
   * A round button with an icon and possible a small text, which hovers above the map
   */
   const dispatch = createEventDispatcher()
</script>


<div on:click={e => dispatch("click", e)} class="subtle-background rounded-full min-w-10 w-fit h-10 m-0.5 md:m-1 p-1">
  <slot class="m-4"></slot>
</div>
