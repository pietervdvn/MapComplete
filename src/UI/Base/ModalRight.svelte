<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { XCircleIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { trapFocus } from "trap-focus-svelte"

  /**
   * The slotted element will be shown on the right side
   */
  const dispatch = createEventDispatcher<{ close }>()
</script>

<div
  aria-modal="true"
  autofocus
  class="absolute top-0 right-0 h-screen w-full overflow-y-auto drop-shadow-2xl md:w-6/12 lg:w-5/12 xl:w-4/12 normal-background flex flex-col"
  role="dialog"
  style="max-width: 100vw; max-height: 100vh"
  tabindex="-1"
  use:trapFocus
>
  <slot name="close-button">
    <button
      class="absolute right-10 top-10 h-8 w-8 cursor-pointer rounded-full"
      on:click={() => dispatch("close")}
    >
      <XCircleIcon />
    </button>
  </slot>
  <div role="document">
    <slot />
  </div>
</div>
