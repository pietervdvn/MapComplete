<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { XCircleIcon } from "@rgossiaux/svelte-heroicons/solid";

  /**
   * The slotted element will be shown on the right side
   */
  const dispatch = createEventDispatcher<{ close }>();
</script>

<div class="absolute top-0 right-0 h-screen overflow-auto w-full md:w-6/12 lg:w-5/12 xl:w-4/12">
  <div class="flex flex-col m-0 p-4 sm:p-6 normal-background normal-background">
    <slot name="close-button">
      <div class="w-8 h-8 absolute right-10 top-10 cursor-pointer" on:click={() => dispatch("close")}>
        <XCircleIcon />
      </div>
    </slot>
    <slot></slot>
  </div>
</div>
