<script lang="ts">
  import StarElement from "./StarElement.svelte"

  /**
   * Number between 0 and 100. Every 10 points, another half star is added
   */
  export let score: number

  let cutoffs = [20, 40, 60, 80, 100]
  export let starSize = "w-h h-4"
  export let readonly = false
</script>

{#if score !== undefined}
  <div class="flex" on:mouseout>
    {#each cutoffs as cutoff, i}
      <StarElement {readonly} {score} {i} {cutoff} {starSize} on:hover on:click />
    {/each}
  </div>
{/if}
