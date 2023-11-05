<script lang="ts">
  import type { ConversionMessage } from "../../Models/ThemeConfig/Conversion/Conversion";
  import { ExclamationIcon, InformationCircleIcon } from "@rgossiaux/svelte-heroicons/solid";

  /**
   * Single conversion message, styled depending on the type
   */
  export let message: ConversionMessage;
</script>

{#if message.level === "error"}
  <div class="alert flex justify-between items-center">
    <ExclamationIcon class="w-6 h-6 mx-1 shrink-0" />
    {message.message}
    <div/>
  </div>
{:else if message.level === "warning"}
  <div class="warning flex justify-between items-center">
    <ExclamationIcon class="w-6 h-6 mx-1 shrink-0" />
    {message.message}
    <div/>
  </div>
{:else if message.level === "information"}
  <div class="information flex justify-between items-center">
    <InformationCircleIcon class="w-6 h-6 mx-1 shrink-0" />
    {message.message}
    <div/>
  </div>
{/if}
