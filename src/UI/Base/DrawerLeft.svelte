<script lang="ts">
  import { Drawer } from "flowbite-svelte"
  import { sineIn } from "svelte/easing"
  import { UIEventSource } from "../../Logic/UIEventSource.js"

  export let shown: UIEventSource<boolean>;
  let transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn
  };
</script>


<Drawer placement="left" transitionType="fly" transitionParams={transitionParams} hidden={!$shown} on:close={() => shown.set(false)}>
  <slot>
    CONTENTS
  </slot>
</Drawer>

