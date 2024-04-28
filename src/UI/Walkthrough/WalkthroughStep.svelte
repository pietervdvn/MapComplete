<script lang="ts">
  import BackButton from "../Base/BackButton.svelte"
  import NextButton from "../Base/NextButton.svelte"
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher<{ back; next }>()
  export let islast = false
  export let isFirst = false
  export let pageNumber: number = undefined
  export let totalPages: number = undefined
</script>

<div class="link-underline flex h-full w-full flex-col justify-between">
  <div class="overflow-y-auto h-full">
    <slot />
  </div>

  <div class="flex flex-col">
    {#if pageNumber !== undefined && totalPages !== undefined}
      <div class="flex justify-end">
        <div class="subtle">{pageNumber + 1}/{totalPages}</div>
      </div>
    {/if}
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
</div>
