<script lang="ts">
  import { Modal } from "flowbite-svelte"
  import { UIEventSource } from "../../Logic/UIEventSource"

  /**
   * Basically a flowbite-svelte modal made more ergonomical
   */

  export let fullscreen: boolean = false
  export let bodyPadding = "p-4 md:p-5 "
  export let shown: UIEventSource<boolean>
  export let dismissable = true
  /**
   * Default: 50
   */
  export let zIndex: string = "z-50"

  const shared =
    "in-page normal-background dark:bg-gray-800 rounded-lg border-gray-200 dark:border-gray-700 border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 shadow-md"
  let defaultClass = "relative flex flex-col mx-auto w-full divide-y " + shared
  if (fullscreen) {
    defaultClass = shared
  }
  let dialogClass = "fixed top-0 start-0 end-0 h-modal inset-0 w-full p-4 flex class-marker-dialog " + zIndex
  if (fullscreen) {
    dialogClass += " h-full-child"
  }
  let bodyClass = bodyPadding + " h-full space-y-4 flex-1 overflow-y-auto overscroll-contain"

  let headerClass = "flex justify-between items-center p-2 px-4 md:px-5 rounded-t-lg"
  if (!$$slots.header) {
    headerClass = "hidden"
  }
  let _shown = false
  shown.addCallbackAndRun((sh) => {
    _shown = sh
  })
</script>

<Modal
  open={_shown}
  on:close={() => shown.set(false)}
  outsideclose
  size="xl"
  {dismissable}
  {defaultClass}
  {bodyClass}
  {dialogClass}
  {headerClass}
  color="none"
>
  <svelte:fragment slot="header">
    {#if $$slots.header}
      <h1 class="page-header w-full">
        <slot name="header" />
      </h1>
    {/if}
  </svelte:fragment>
  <slot />
  {#if $$slots.footer}
    <slot name="footer" />
  {/if}
</Modal>
