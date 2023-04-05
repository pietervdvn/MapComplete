<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { XCircleIcon } from "@rgossiaux/svelte-heroicons/solid";

  /**
   * The slotted element will be shown on top, with a lower-opacity border
   */
  const dispatch = createEventDispatcher<{ close }>();
</script>

<div class="absolute top-0 right-0 w-screen h-screen overflow-auto" style="background-color: #00000088">
  <div class="flex flex-col m-4 sm:m-6 md:m-8 p-4 sm:p-6 md:m-8 normal-background rounded normal-background">
    <slot name="close-button">
      <div class="w-8 h-8 absolute right-10 top-10 cursor-pointer" on:click={() => dispatch("close")}>
        <XCircleIcon />
      </div>
    </slot>
    <slot></slot>
  </div>
</div>
