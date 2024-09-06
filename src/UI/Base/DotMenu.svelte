<script lang="ts">
  import DotsCircleHorizontal from "@rgossiaux/svelte-heroicons/solid/DotsCircleHorizontal"
  import { Dropdown } from "flowbite-svelte"
  import { TrashIcon } from "@babeard/svelte-heroicons/mini"
  import SidebarUnit from "./SidebarUnit.svelte"
  import { UIEventSource } from "../../Logic/UIEventSource"

  /**
   * A menu, opened by a dot
   */
  export let dotColor = "var(--background-interactive)"
  export let placement: "left" | "right" | "top" | "bottom" = "left"

  export let isOpen : UIEventSource<boolean> = new UIEventSource<boolean>(false)
  let _isOpen = isOpen.data
  $: {
    console.log("is open?", _isOpen)
    isOpen.set(_isOpen)
  }
</script>

<DotsCircleHorizontal class="w-6 h-6 dots-menu-themes transition-colors"  color={$isOpen ? "black": "var(--interactive-background)"} />
<Dropdown placement="left" bind:open={_isOpen} triggeredBy=".dots-menu-themes" containerClass="p-1 border border-2 border-gray button-unstyled">
  <SidebarUnit>
    <slot />
  </SidebarUnit>
</Dropdown>
