<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { XCircleIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { twMerge } from "tailwind-merge"
  import { trapFocus } from "trap-focus-svelte"
  import { ariaLabel } from "../../Utils/ariaLabel"
  import Translations from "../i18n/Translations"

  /**
   * The slotted element will be shown on top, with a lower-opacity border
   */
  const dispatch = createEventDispatcher<{ close }>()

</script>

<!-- Draw the background over the total screen -->
<div
  class="absolute top-0 left-0 h-screen w-screen"
  on:click={() => {
    dispatch("close")
  }}
  style="background-color: #00000088; z-index: 20"
/>
<!-- draw a _second_ absolute div, placed using 'bottom' which will be above the navigation bar on mobile browsers -->
<div
  class={"absolute bottom-0 right-0 h-full w-screen p-4 md:p-6"}
  style="z-index: 21"
  use:trapFocus
>
  <div class="content normal-background h-full" on:click|stopPropagation={() => {}}>
    <div class="h-full rounded-xl">
      <slot />
    </div>
    <slot name="close-button">
      <!-- The close button is placed _after_ the default slot in order to always paint it on top -->
      <button
        class="absolute right-10 top-10 h-8 w-8 cursor-pointer rounded-full border-none bg-white p-0"
        on:click={() => dispatch("close")}
        use:ariaLabel={Translations.t.general.backToMap}
      >
        <XCircleIcon />
      </button>
    </slot>
  </div>
</div>

<style>
  .content {
    border-radius: 0.5rem;
    overflow-x: hidden;
    box-shadow: 0 0 1rem #00000088;
  }
</style>
