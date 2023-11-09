<script lang="ts">
  /**
   * Wrapper around 'subtleButton' with an arrow pointing to the right
   * See also: BackButton
   */
  import SubtleButton from "./SubtleButton.svelte"
  import { ChevronRightIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { createEventDispatcher } from "svelte"
  import { twMerge } from "tailwind-merge"

  const dispatch = createEventDispatcher<{ click }>()

  export let clss: string | undefined = undefined
</script>

<SubtleButton
  on:click={() => dispatch("click")}
  options={{ extraClasses: twMerge("flex items-center", clss) }}
>
  <slot name="image" slot="image" />
  <div class="flex w-full items-center justify-between" slot="message">
    <slot />
    <ChevronRightIcon
      class={clss?.indexOf("small") >= 0 ? "h-4 w-4 shrink-0" : "h-12 w-12 shrink-0"}
    />
  </div>
</SubtleButton>
