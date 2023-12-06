<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { XCircleIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { twMerge } from "tailwind-merge"

  /**
   * The slotted element will be shown on top, with a lower-opacity border
   */
  const dispatch = createEventDispatcher<{ close }>()
  
  export let extraClasses = "p-4 md:p-6"
  
  let mainContent: HTMLElement
  onMount(() => {
    console.log("Mounting floatover")
    mainContent?.focus()
  })
</script>

<div
  class={twMerge("absolute top-0 right-0 h-screen w-screen", extraClasses)}
  style="background-color: #00000088; z-index: 20"
  on:click={() => {
    dispatch("close")
  }}
>
  <div bind:this={mainContent} class="content normal-background" on:click|stopPropagation={() => {}}>
    <div class="h-full rounded-xl">
      <slot />
    </div>
    <slot name="close-button">
      <!-- The close button is placed _after_ the default slot in order to always paint it on top -->
      <div
        class="absolute right-10 top-10 h-8 w-8 cursor-pointer"
        on:click={() => dispatch("close")}
      >
        <XCircleIcon />
      </div>
    </slot>
  </div>
</div>

<style>
  .content {
    height: 100%;
    border-radius: 0.5rem;
    overflow-x: hidden;
    box-shadow: 0 0 1rem #00000088;
  }
</style>
