<script lang="ts">
  import Icon from "./Icon.svelte"

  /**
   * Renders a 'marker', which consists of multiple 'icons'
   */
  export let icons: { icon: string; color: string }[]
</script>

{#if icons !== undefined && icons.length > 0}
  <div class="relative h-full w-full">
    {#each icons as icon}
      <div class="absolute top-0 left-0 h-full w-full">
        <Icon icon={icon.icon} color={icon.color} />
      </div>
    {/each}
  </div>
{/if}
