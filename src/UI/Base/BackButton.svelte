<script lang="ts">
  /**
   * Wrapper around 'subtleButton' with an arrow pointing to the right
   * See also: NextButton
   */
  import SubtleButton from "./SubtleButton.svelte"
  import { ChevronLeftIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { createEventDispatcher } from "svelte"
  import { twMerge } from "tailwind-merge"

  const dispatch = createEventDispatcher<{ click }>()
  export let clss: string | undefined = undefined
  export let imageClass: string | undefined = undefined
</script>

<SubtleButton
  on:click={() => dispatch("click")}
  options={{ extraClasses: twMerge("flex items-center", clss) }}
>
  <ChevronLeftIcon class={imageClass ?? "h-12 w-12"} slot="image" />
  <slot slot="message" />
</SubtleButton>
