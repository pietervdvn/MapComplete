<script lang="ts">
  import { Drawer } from "flowbite-svelte"
  import { sineIn } from "svelte/easing"
  import { Store } from "../../Logic/UIEventSource.js"
  import { onMount } from "svelte"

  export let shown: Store<boolean>
  let transitionParams = {
    x: 640,
    duration: 200,
    easing: sineIn,
  }
  let hidden = !shown.data

  shown.addCallback((sh) => {
    hidden = !sh
  })

  let height = 0
  onMount(() => {
    let topbar = document.getElementById("top-bar")
    height = topbar.clientHeight
  })
</script>

<Drawer
  placement="right"
  transitionType="fly"
  {transitionParams}
  activateClickOutside={false}
  divClass="overflow-y-auto z-3"
  backdrop={false}
  id="drawer-right"
  width="w-full sm:w-80 md:w-96"
  rightOffset="inset-y-0 right-0"
  bind:hidden
>
  <div class="low-interaction h-screen">
    <div class="h-full" style={`padding-top: ${height}px`}>
      <div class="flex h-full flex-col overflow-y-auto">
        <slot />
      </div>
    </div>
  </div>
</Drawer>
