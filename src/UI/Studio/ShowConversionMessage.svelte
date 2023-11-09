<script lang="ts">
  import type { ConversionMessage } from "../../Models/ThemeConfig/Conversion/Conversion"
  import { ExclamationIcon, InformationCircleIcon } from "@rgossiaux/svelte-heroicons/solid"

  /**
   * Single conversion message, styled depending on the type
   */
  export let message: ConversionMessage
</script>

{#if message.level === "error"}
  <div class="alert flex items-center justify-between">
    <ExclamationIcon class="mx-1 h-6 w-6 shrink-0" />
    {message.message}
    <div />
  </div>
{:else if message.level === "warning"}
  <div class="warning flex items-center justify-between">
    <ExclamationIcon class="mx-1 h-6 w-6 shrink-0" />
    {message.message}
    <div />
  </div>
{:else if message.level === "information"}
  <div class="information flex items-center justify-between">
    <InformationCircleIcon class="mx-1 h-6 w-6 shrink-0" />
    {message.message}
    <div />
  </div>
{/if}
