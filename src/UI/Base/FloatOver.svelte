<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { XCircleIcon } from "@rgossiaux/svelte-heroicons/solid";
  import { twMerge } from "tailwind-merge";
  import { Utils } from "../../Utils";
  import { trapFocus } from 'trap-focus-svelte'
  /**
   * The slotted element will be shown on top, with a lower-opacity border
   */
  const dispatch = createEventDispatcher<{ close }>();

  export let extraClasses = "p-4 md:p-6";


</script>

  <!-- Draw the background over the total screen -->
<div class="w-screen h-screen absolute top-0 left-0" style="background-color: #00000088; z-index: 20"   on:click={() => {
    dispatch("close")
  }}>
</div>
<!-- draw a _second_ absolute div, placed using 'bottom' which will be above the navigation bar on mobile browsers -->
<div
  class={twMerge("absolute bottom-0 right-0 h-full w-screen", extraClasses)}
  use:trapFocus
  style="z-index: 21"
>
  <div class="content normal-background" on:click|stopPropagation={() => {}}>
    <div class="h-full rounded-xl">
      <slot />
    </div>
    <slot name="close-button">
      <!-- The close button is placed _after_ the default slot in order to always paint it on top -->
      <button
        class="absolute right-10 top-10 h-8 w-8 cursor-pointer p-0 border-none bg-white"
        on:click={() => dispatch("close")}
      >
        <XCircleIcon />
      </button>
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
