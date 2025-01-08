<script lang="ts">
  import { Utils } from "../../Utils"
  import Loading from "./Loading.svelte"

  /**
   * Some components are slow to load
   * This item draws a 'loading' and will only start loading after a few milliseconds
   */
  export let timeout = 200
  let timeoutReached = false
  Utils.waitFor(timeout).then(() => {
    timeoutReached = true
  })
</script>


{#if timeoutReached}
  <slot />
{:else }
  <Loading cls="h-full w-full flex justify-center items-center low-interaction"/>
{/if}
