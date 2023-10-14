<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { XCircleIcon } from "@rgossiaux/svelte-heroicons/solid"

  /**
   * The slotted element will be shown on the right side
   */
  const dispatch = createEventDispatcher<{ close }>()
</script>

<div
  class="absolute top-0 right-0 h-screen w-full overflow-y-auto drop-shadow-2xl md:w-6/12 lg:w-5/12 xl:w-4/12"
  style="max-width: 100vw; max-height: 100vh"
>
  <div class="normal-background m-0 flex flex-col">
    <slot name="close-button">
      <div
        class="absolute right-10 top-10 h-8 w-8 cursor-pointer"
        on:click={() => dispatch("close")}
      >
        <XCircleIcon />
      </div>
    </slot>
    <slot />
  </div>
</div>
