<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { XCircleIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { trapFocus } from "trap-focus-svelte"
  import { Utils } from "../../Utils"

  /**
   * The slotted element will be shown on the right side
   */
  const dispatch = createEventDispatcher<{ close }>()
  let mainContent: HTMLElement


</script>

<div
  autofocus
  bind:this={mainContent}
  class="absolute top-0 right-0 h-screen w-full overflow-y-auto drop-shadow-2xl md:w-6/12 lg:w-5/12 xl:w-4/12 normal-background flex flex-col"
  role="dialog"
  tabindex="-1"
  aria-modal="true"
  style="max-width: 100vw; max-height: 100vh"
  use:trapFocus
>
  <slot name="close-button">
    <button
      class="absolute right-10 top-10 h-8 w-8 cursor-pointer"
      on:click={() => dispatch("close")}
    >
      <XCircleIcon />
    </button>
  </slot>
  <div role="document" >
  <slot />
  </div>
</div>
