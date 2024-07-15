<script lang="ts">
import StatusIcon from "./StatusIcon.svelte"
import type { MCService } from "./MCService.js"
import AccordionSingle from "../Flowbite/AccordionSingle.svelte"

export let service: MCService
let status = service.status
let msg = service.message
</script>


<AccordionSingle>

<h3 slot="header" class="flex items-center m-0"> <StatusIcon status={$status}/> {service.name}</h3>
<div class="mx-4">
  {#if $msg}
  {$msg}
    {:else}
    No extra information available
    {/if}
</div>
</AccordionSingle>
