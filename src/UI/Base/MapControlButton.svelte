<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { twJoin } from "tailwind-merge"
  import { Translation } from "../i18n/Translation"
  import { ariaLabel, ariaLabelStore } from "../../Utils/ariaLabel"
  import { ImmutableStore, Store, UIEventSource } from "../../Logic/UIEventSource"

  /**
   * A round button with an icon and possible a small text, which hovers above the map
   */
  const dispatch = createEventDispatcher()
  export let cls = "m-0.5 p-0.5 sm:p-1 md:m-1"
  export let enabled: Store<boolean> = new ImmutableStore(true)
  export let arialabel: Translation = undefined
  export let arialabelDynamic: Store<Translation> = new ImmutableStore(arialabel)
  let arialabelString = arialabelDynamic.bind((tr) => tr?.current)
</script>

<button
  on:click={(e) => dispatch("click", e)}
  on:keydown
  use:ariaLabelStore={arialabelString}
  disabled={!$enabled}
  class={twJoin(
    "pointer-events-auto relative h-fit w-fit rounded-full",
    cls,
    $enabled ? "" : "disabled"
  )}
>
  <slot />
</button>
