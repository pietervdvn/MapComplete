<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { XCircleIcon } from "@rgossiaux/svelte-heroicons/solid"

  /**
   * The slotted element will be shown on top, with a lower-opacity border
   */
  const dispatch = createEventDispatcher<{ close }>()
</script>

<div
  class="absolute top-0 right-0 h-screen w-screen p-4 md:p-6"
  style="background-color: #00000088"
  on:click={() => {
    dispatch("close")
  }}
>
  <div class="content normal-background" on:click|stopPropagation={() => {}}>
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
    height: calc(100vh - 2rem);
    border-radius: 0.5rem;
    overflow-x: auto;
    box-shadow: 0 0 1rem #00000088;
  }
</style>
