<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import DotsCircleHorizontal from "@rgossiaux/svelte-heroicons/solid/DotsCircleHorizontal"

  /**
   * A menu, opened by a dot
   */
  export let dotColor = "var(--background-interactive)"
  export let placement: "left" | "right" | "top" | "bottom" = "left"
  export let open = new UIEventSource(false)

  function toggle() {
    open.set(!open.data)
  }
</script>

<div class="relative" style="z-index: 50">
  <div
    class="sidebar-unit absolute right-0 top-0 collapsable normal-background button-unstyled border-2 border-gray-300"
    class:collapsed={!$open}>
    <slot />
  </div>
  <DotsCircleHorizontal class={ `absolute top-0 right-0 w-6 h-6 dots-menu transition-colors ${$open?"dots-menu-opened":""}`} on:click={toggle} />
</div>


<style>
    .dots-menu{
        z-index: 50;
    }
    :global(.dots-menu > path) {
        fill: var(--interactive-background);
        transition: fill 350ms linear;

    }

    :global(.dots-menu:hover > path, .dots-menu-opened > path) {
        fill: var(--interactive-foreground)
    }

    .collapsable {
        max-width: 100rem;
        max-height: 100rem;
        transition: max-width 500ms ease-in-out, border 400ms linear;
        overflow: hidden;
        flex-wrap: nowrap;
        text-wrap: none;
        width: max-content;
        box-shadow: #ccc ;
        white-space: nowrap;
    }

    .collapsed {
        max-width: 0;
        border: 2px solid #00000000
    }

</style>
