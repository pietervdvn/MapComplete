<script lang="ts">
  import { Accordion, AccordionItem } from "flowbite-svelte"

  export let expanded = false
</script>

<Accordion>
  <AccordionItem open={expanded} paddingDefault="p-0" inactiveClass="text-black">
    <span slot="header" class="p-2 text-base w-full">
      <slot name="header" />
    </span>
    <div class="low-interaction rounded-b p-2">
      <slot />
    </div>
  </AccordionItem>
</Accordion>
