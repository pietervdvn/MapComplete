<script lang="ts">
  /**
   * Wrapper around 'subtleButton' with an arrow pointing to the right
   * See also: BackButton
   */
  import SubtleButton from "./SubtleButton.svelte"
  import { ChevronRightIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher<{ click }>()

  export let clss: string = ""
</script>

<SubtleButton
  on:click={() => dispatch("click")}
  options={{ extraClasses: clss + " flex items-center" }}
>
  <slot name="image" slot="image" />
  <div class="w-full flex justify-between items-center" slot="message">
    <slot />
    <ChevronRightIcon class="w-12 h-12" />
  </div>
</SubtleButton>
