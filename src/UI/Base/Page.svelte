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

  const shared = "defaultClass normal-background dark:bg-gray-800 rounded-lg border-gray-200 dark:border-gray-700 border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 shadow-md"
  let defaultClass = "relative flex flex-col mx-auto w-full divide-y " + shared
  if (fullscreen) {
    defaultClass = shared
  }
  let dialogClass = "fixed top-0 start-0 end-0 h-modal inset-0 z-50 w-full p-4 flex";
  if(fullscreen){
    dialogClass += " h-full-child"
  }
  let bodyClass = "h-full p-4 md:p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain"
</script>

{#if !onlyLink}
  <Modal open={_shown} on:close={() => shown.set(false)} size="xl" {defaultClass} {bodyClass} {dialogClass} color="none">
    <slot name="header" slot="header" />
    <slot />
    {#if $$slots.footer}
      <slot name="footer" />
    {/if}
  </Modal>
{:else}
  <button class="as-link" on:click={() => shown.setData(true)}>
    <slot name="header" />
  </button>
{/if}
