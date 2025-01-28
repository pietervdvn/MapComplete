<script lang="ts">
  import ArrowDownTray from "@babeard/svelte-heroicons/mini/ArrowDownTray"
  import { Utils } from "../Utils"

  export let customDefinition: string
  export let stack: string[]

  function offerDefinitionForDownload() {
    Utils.offerContentsAsDownloadableFile(customDefinition, "mapcomplete-theme.json", {
      mimetype: "application/json",
    })
  }
</script>

<div class="m-8 flex h-full w-full flex-col items-center justify-center">
  <h1>Something went wrong</h1>
  <div class="alert">{stack[0]}</div>
  {#each stack.slice(1) as stck}
    <div>{stck}</div>
  {/each}
  {#if customDefinition}
    <button on:click={() => offerDefinitionForDownload()}>
      <ArrowDownTray class="h-16 w-16" />
      Download the theme definition file
    </button>
  {/if}
</div>
