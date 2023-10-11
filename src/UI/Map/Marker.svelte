<script lang="ts">

  import Icon from "./Icon.svelte";

  /**
   * Renders a 'marker', which consists of multiple 'icons'
   */
export  let icons: { icon: string, color: string }[] 

</script>
{#if icons !== undefined && icons.length > 0}
  <div class="relative w-full h-full">
    {#each icons as icon}
      <Icon icon={icon.icon} color={icon.color} />
    {/each}
  </div>
{/if}
