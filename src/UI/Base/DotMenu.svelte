<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import DotsCircleHorizontal from "@rgossiaux/svelte-heroicons/solid/DotsCircleHorizontal"

  /**
   * A menu, opened by a dot
   */

  export let open = new UIEventSource(false)
  export let dotsSize = `w-6 h-6`
  export let dotsPosition = `top-0 right-0`
  export let hideBackground: boolean = false
  let menuPosition = ``
  if (dotsPosition.indexOf("left-0") >= 0) {
    menuPosition = "left-0"
  } else {
    menuPosition = `right-0`
  }

  if (dotsPosition.indexOf("top-0") > 0) {
    menuPosition += " bottom-0"
  } else {
    menuPosition += ` top-0`
  }

  function toggle() {
    open.set(!open.data)
  }
</script>

<div class="relative" style="z-index: 39">
  <div
    class="sidebar-unit absolute {menuPosition} collapsable normal-background button-unstyled"
    class:transition-background={hideBackground}
    class:collapsed={!$open}
  >
    <slot />
  </div>
  <DotsCircleHorizontal
    class={`absolute ${dotsPosition} ${dotsSize} dots-menu transition-colors ${
      $open ? "dots-menu-opened" : ""
    }`}
    on:click={toggle}
  />
</div>

<style>
  .dots-menu {
    z-index: 50;
  }

  :global(.dots-menu > path) {
        fill: var(--button-background-hover);
    transition: fill 350ms linear;
    cursor: pointer;
  }

  :global(.dots-menu:hover > path, .dots-menu-opened > path) {
    fill: var(--interactive-foreground);
  }

  .collapsable {
    max-width: 50rem;
    max-height: 10rem;
    transition: max-width 500ms linear, max-height 500ms linear, border 500ms linear;
    overflow: hidden;
    flex-wrap: nowrap;
    text-wrap: none;
    width: max-content;
    box-shadow: #ccc;
    white-space: nowrap;
    border: 1px solid var(--button-background);
    background-color: white;
  }

    .transition-background {
        transition: background-color 150ms linear;
    }

  .transition-background.collapsed {
    background-color: #00000000;
  }

  .collapsed {
    max-width: 0;
    max-height: 0;
    border: 2px solid #00000000;
    pointer-events: none;
  }
</style>
