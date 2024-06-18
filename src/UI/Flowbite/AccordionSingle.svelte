<script lang="ts">
  import { Accordion, AccordionItem } from "flowbite-svelte"

  export let expanded = false
</script>

<Accordion>
  <AccordionItem open={expanded} paddingDefault="p-0" inactiveClass="text-black">
    <span slot="header" class="text-base p-2 ">
      <slot name="header" />
    </span>
    <div class="low-interaction p-2 rounded-b">
      <slot />
    </div>
  </AccordionItem>
</Accordion>

