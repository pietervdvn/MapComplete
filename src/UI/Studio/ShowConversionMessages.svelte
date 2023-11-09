<script lang="ts">
  import type { ConversionMessage } from "../../Models/ThemeConfig/Conversion/Conversion"

  export let messages: ConversionMessage[]
</script>

{#if messages.length === 0}
  <div class="thanks">No errors, warnings or messages</div>
{/if}

{#each messages as message}
  <li>
    {message.level}
    <span class="literal-code">{message.context.path.join(".")}</span>
    {message.message}
    <span class="literal-code">
      {message.context.operation.join(".")}
    </span>
  </li>
{/each}
