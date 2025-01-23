<script lang="ts">
  import ArrowDownTray from "@babeard/svelte-heroicons/mini/ArrowDownTray"
  import { Utils } from "../Utils"

  export let customDefinition: string
  export let stack: string[]

  function offerDefinitionForDownload() {
    Utils.offerContentsAsDownloadableFile(
      customDefinition,
      "mapcomplete-theme.json",
      { mimetype: "application/json" }
    )
  }

</script>

<div class="flex flex-col w-full h-full m-8 justify-center items-center">

  <h1>Something went wrong</h1>
  <div class="alert">{stack[0]}</div>
  {#each stack.slice(1) as stck}
    <div>{stck}</div>
  {/each}
  {#if customDefinition}
    <button on:click={() => offerDefinitionForDownload()}>
      <ArrowDownTray class="w-16 h-16" />
      Download the theme definition file
    </button>
  {/if}
</div>
