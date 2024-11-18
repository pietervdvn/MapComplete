<script lang="ts">
  // A fake 'page' which can be shown; kind of a modal
  import { UIEventSource } from "../../Logic/UIEventSource"
  import Popup from "./Popup.svelte"

  export let onlyLink: boolean = false
  export let bodyPadding = "p-4 md:p-5 "
  export let fullscreen: boolean = false
  export let shown: UIEventSource<boolean>
</script>

{#if !onlyLink}
  <Popup {shown} {bodyPadding} {fullscreen}>
    <slot name="header" slot="header" />
    <slot />
    <slot name="footer" slot="footer" />
  </Popup>
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
