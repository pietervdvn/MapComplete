<script lang="ts">
  /**
   * Wrapper around 'subtleButton' with an arrow pointing to the right
   * See also: NextButton
   */
  import SubtleButton from "./SubtleButton.svelte"
  import { ChevronLeftIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher<{ click }>()
  export let clss = ""
</script>

<SubtleButton
  on:click={() => dispatch("click")}
  options={{ extraClasses: clss + " flex items-center" }}
>
  <ChevronLeftIcon class="h-12 w-12" slot="image" />
  <slot slot="message" />
</SubtleButton>
