<script lang="ts">
  import Icon from "./Icon.svelte"
  import { twMerge } from "tailwind-merge"

  /**
   * Renders a 'marker', which consists of multiple 'icons'
   */
  export let icons: { icon: string; color: string }[]
  /**
   * Class which is applied onto the individual icons
   */
  export let clss = ""
  export let size = "w-full h-full"
</script>

{#if icons !== undefined && icons.length > 0}
  <div class={twMerge("relative", size)}>
    {#each icons as icon}
      <div class="absolute top-0 left-0 h-full w-full">
        <Icon icon={icon.icon} color={icon.color} {clss} />
      </div>
    {/each}
  </div>
{/if}
