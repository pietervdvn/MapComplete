<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import DotsCircleHorizontal from "@rgossiaux/svelte-heroicons/solid/DotsCircleHorizontal"

  /**
   * A menu, opened by a dot
   */

  export let open = new UIEventSource(false)

  function toggle() {
    open.set(!open.data)
  }


</script>

<div class="relative" style="z-index: 50">
  <div
    class="sidebar-unit absolute right-0 top-0 collapsable normal-background button-unstyled"
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
        cursor: pointer;

    }

    :global(.dots-menu:hover > path, .dots-menu-opened > path) {
        fill: var(--interactive-foreground)
    }

    .collapsable {
        max-width: 100rem;
        max-height: 100rem;
        transition: border 150ms linear, max-width 500ms linear, max-height 500ms linear;
        overflow: hidden;
        flex-wrap: nowrap;
        text-wrap: none;
        width: max-content;
        box-shadow: #ccc ;
        white-space: nowrap;
        border: 1px solid var(--button-background);
    }

    .collapsed {
        max-width: 0;
        max-height: 0;
        border: 2px solid #00000000;
        pointer-events: none;
    }

</style>
