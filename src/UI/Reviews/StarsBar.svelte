<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import StarElement from "./StarElement.svelte";

  /**
   * Number between 0 and 100. Every 10 points, another half star is added
   */
  export let score: number;
  let dispatch = createEventDispatcher<{ hover: number, click: number }>();

  let cutoffs = [20,40,60,80,100]
  export let starSize = "w-h h-4"

</script>
{#if score !== undefined}
<div class="flex" on:mouseout>
  {#each cutoffs as cutoff}
    <StarElement {score} {cutoff} {starSize} on:hover on:click/>
    {/each}
</div>
  {/if}
