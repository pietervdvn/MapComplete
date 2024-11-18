<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { ariaLabel } from "../../Utils/ariaLabel"
  import Translations from "../i18n/Translations"
  import { XCircleIcon } from "@babeard/svelte-heroicons/solid"
  import { CloseButton } from "flowbite-svelte"

  /**
   * The slotted element will be shown on top, with a lower-opacity border
   */
  const dispatch = createEventDispatcher<{ close }>()
</script>

<!-- Draw the background over the total screen -->
<div
  class="absolute top-0 left-0 h-screen w-screen"
  on:click={() => {
    console.log("OnClose")
    dispatch("close")
  }}
  style="background-color: #00000088; z-index: 20"
/>
<!-- draw a _second_ absolute div, placed using 'bottom' which will be above the navigation bar on mobile browsers -->
<div
  class="pointer-events-none absolute bottom-0 right-0 h-full w-screen p-4 md:p-6"
  style="z-index: 21"
  on:click={() => {
    console.log("Closing...")
    dispatch("close")
  }}
>
  <div
    class="content normal-background pointer-events-auto relative h-full"
    on:click|stopPropagation={() => {}}
  >
    <div class="h-full rounded-xl">
      <slot />
    </div>
    <slot name="close-button">
      <!-- The close button is placed _after_ the default slot in order to always paint it on top -->
      <div class="absolute top-0 right-0">
        <CloseButton class="normal-background mt-2 mr-2" on:click={() => dispatch("close")} />
      </div>
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
