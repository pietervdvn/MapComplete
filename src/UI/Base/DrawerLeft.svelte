<script lang="ts">
  import { Drawer } from "flowbite-svelte"
  import { sineIn } from "svelte/easing"
  import { UIEventSource } from "../../Logic/UIEventSource.js"

  export let shown: UIEventSource<boolean>
  let transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn,
  }
  let hidden = !shown.data
  $: {
    shown.setData(!hidden)
  }
  shown.addCallback((sh) => {
    hidden = !sh
  })
</script>

<Drawer
  placement="left"
  transitionType="fly"
  {transitionParams}
  divClass="overflow-y-auto z-50 "
  bind:hidden
>
  <slot>CONTENTS</slot>
</Drawer>
