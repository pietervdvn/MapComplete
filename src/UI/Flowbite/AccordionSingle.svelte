<script lang="ts">
  import { Accordion, AccordionItem } from "flowbite-svelte"

  export let expanded = false
  export let noBorder = false
  export let contentClass = noBorder ? "normal-background" : "low-interaction rounded-b p-2"
  let defaultClass: string = undefined
  if (noBorder) {
    defaultClass = "unstyled w-full flex-grow"
  }
</script>

<Accordion>
  <AccordionItem open={expanded} paddingDefault="p-0" inactiveClass="text-black" {defaultClass}>
    <span slot="header" class={!noBorder ? "w-full p-2 text-base" : "w-full"}>
      <slot name="header" />
    </span>
    <div class={contentClass}>
      <slot />
    </div>
  </AccordionItem>
</Accordion>
