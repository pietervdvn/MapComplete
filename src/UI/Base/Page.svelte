<script lang="ts">
  // A fake 'page' which can be shown; kind of a modal
  import { UIEventSource } from "../../Logic/UIEventSource"
  import { Modal } from "flowbite-svelte"

  export let shown: UIEventSource<boolean>
  let _shown = false
  export let onlyLink: boolean = false
  shown.addCallbackAndRun(sh => {
    _shown = sh
  })
  export let fullscreen: boolean = false

  const shared = "in-page normal-background dark:bg-gray-800 rounded-lg border-gray-200 dark:border-gray-700 border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 shadow-md"
  let defaultClass = "relative flex flex-col mx-auto w-full divide-y " + shared
  if (fullscreen) {
    defaultClass = shared
  }
  let dialogClass = "fixed top-0 start-0 end-0 h-modal inset-0 z-50 w-full p-4 flex"
  if (fullscreen) {
    dialogClass += " h-full-child"
  }
  export let bodyPadding = "p-4 md:p-5 "
  let bodyClass = bodyPadding+" h-full space-y-4 flex-1 overflow-y-auto overscroll-contain"

  let headerClass = "flex justify-between items-center p-2 px-4 md:px-5 rounded-t-lg";


</script>

{#if !onlyLink}
  <Modal open={_shown} on:close={() => shown.set(false)} outsideclose
         size="xl"
         {defaultClass} {bodyClass} {dialogClass} {headerClass}
         color="none">
    <h1 slot="header" class="page-header w-full">
      <slot name="header" />
    </h1>
    <slot />
    {#if $$slots.footer}
      <slot name="footer" />
    {/if}
  </Modal>
{:else}
  <button class="as-link sidebar-button" on:click={() => shown.setData(true)}>
    <slot name="link">
    <slot name="header" />
    </slot>
  </button>
{/if}

<style>
    :global(.page-header) {
        display: flex;
        align-items: center;
    }

  :global(.page-header svg) {
      width: 2rem;
      height: 2rem;
      margin-right: 0.75rem;
  }
</style>
