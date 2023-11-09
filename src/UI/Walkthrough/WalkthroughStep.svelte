<script lang="ts">
  import BackButton from "../Base/BackButton.svelte"
  import NextButton from "../Base/NextButton.svelte"
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher<{ back; next }>()
  export let islast = false
  export let isFirst = false
</script>

<div class="flex h-full w-full flex-col justify-between">
  <div class="overflow-y-auto">
    <slot />
  </div>

  <div class="flex w-full">
    {#if !isFirst}
      <BackButton clss="w-full" on:click={() => dispatch("back")}>Back</BackButton>
    {:else}
      <div class="w-full" />
    {/if}
    <NextButton clss="primary w-full" on:click={() => dispatch("next")}>
      {#if islast}
        Finish
      {:else}
        Next
      {/if}
    </NextButton>
  </div>
</div>
